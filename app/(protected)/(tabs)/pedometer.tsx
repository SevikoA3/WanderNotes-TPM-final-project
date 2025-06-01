// {Header Part}
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { eq } from "../../db/db";
import { notes } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

const StepCounterScreen = () => {
  // {State Management}
  const [isPedometerAvailable, setIsPedometerAvailable] =
    useState<string>("checking");
  const [pastStepCount, setPastStepCount] = useState<number>(0);
  const [currentStepCount, setCurrentStepCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [stepStart, setStepStart] = useState<number | null>(null);
  const [stepCounted, setStepCounted] = useState<number>(0);
  const [permissionStatus, setPermissionStatus] = useState<string>("checking");
  const [noteList, setNoteList] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  let subscriptionRef = React.useRef<any>(null);
  const { user } = useAuth();

  // {Start Counting Handler}
  const startCounting = async () => {
    // Cek ulang permission setiap kali start
    let permStatus = permissionStatus;
    try {
      const perm = await Pedometer.getPermissionsAsync();
      permStatus = perm.status;
      setPermissionStatus(perm.status);
      if (perm.status !== "granted") {
        const req = await Pedometer.requestPermissionsAsync();
        permStatus = req.status;
        setPermissionStatus(req.status);
        if (req.status !== "granted") {
          Alert.alert(
            "Pedometer Permission Required",
            "Please allow pedometer access in your device settings to use this feature."
          );
          return;
        }
      }
    } catch (e) {
      // Jika error, tampilkan alert
      Alert.alert(
        "Pedometer Error",
        "Failed to check/request pedometer permission."
      );
      return;
    }
    if (!selectedNoteId) {
      Alert.alert("No Note Selected", "Please select a note first.");
      return;
    }
    setIsCounting(true);
    // Save current stepCounted as base
    const baseStepCounted = stepCounted;
    setStepStart(currentStepCount);
    if (subscriptionRef.current) subscriptionRef.current.remove();
    subscriptionRef.current = Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps);
      if (stepStart !== null) {
        // Add new steps to previous stepCounted
        setStepCounted(baseStepCounted + (result.steps - stepStart));
      } else {
        setStepCounted(baseStepCounted);
      }
    });
  };

  // {Stop Counting Handler}
  const stopCounting = async () => {
    setIsCounting(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (selectedNoteId) {
      const note = noteList.find((n) => n.id.toString() === selectedNoteId);
      if (note) {
        // Calculate stepCounted directly for accuracy
        const counted = stepStart !== null ? currentStepCount - stepStart : 0;
        await db
          .update(notes)
          .set({ stepCount: counted })
          .where(eq(notes.id, note.id));
        // Update state so user sees latest result
        setStepCounted(counted);
        alert("Steps successfully saved to note!");
        await fetchNotes(); // Wait for update before refresh
      }
    }
  };

  // {Reset Counting Handler}
  const resetCounting = async () => {
    if (isCounting) return;
    if (stepCounted === 0) return;

    // Show confirmation dialog before resetting
    Alert.alert(
      "Reset Steps",
      "Are you sure you want to reset the steps for this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            if (selectedNoteId) {
              const note = noteList.find(
                (n) => n.id.toString() === selectedNoteId
              );
              if (note) {
                await db
                  .update(notes)
                  .set({ stepCount: 0 })
                  .where(eq(notes.id, note.id));
                await fetchNotes();
                alert("Note steps have been reset to 0");
              }
            }

            // Reset local state
            setStepStart(null);
            setStepCounted(0);
            setIsCounting(false);
            if (subscriptionRef.current) {
              subscriptionRef.current.remove();
              subscriptionRef.current = null;
            }
          },
        },
      ]
    );
  };

  // {Fetch Notes for User}
  const fetchNotes = async () => {
    if (!user) return;
    const allNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user.id))
      .all();
    setNoteList(allNotes);
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      fetchNotes();
      return () => {
        isActive = false;
      };
    }, [user])
  );

  // {Save Steps to Note Handler}
  const handleSaveStepToNote = async () => {
    if (!selectedNote) return;
    await db
      .update(notes)
      .set({ stepCount: stepCounted })
      .where(eq(notes.id, selectedNote.id));
    setModalVisible(false);
    setSelectedNote(null);
    setStepCounted(0);
    alert("Steps successfully saved to note!");
  };

  // Helper: Find note by selectedNoteId
  const getSelectedNote = () => {
    return noteList.find((n) => n.id.toString() === selectedNoteId);
  };

  // Helper: Calculate session steps
  const getSessionSteps = () => {
    return stepStart !== null ? Math.max(0, currentStepCount - stepStart) : 0;
  };

  // Handler: Stop counting and accumulate steps to note
  const handleStopCounting = async () => {
    if (!selectedNoteId) {
      Alert.alert("No Note Selected", "Please select a note first.");
      return;
    }
    setIsCounting(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (selectedNoteId) {
      const note = getSelectedNote();
      if (note) {
        const sessionSteps = getSessionSteps();
        const newStepCount = (note.stepCount ?? 0) + sessionSteps;
        await db
          .update(notes)
          .set({ stepCount: newStepCount })
          .where(eq(notes.id, note.id));
        setStepCounted(newStepCount);
        alert("Steps successfully accumulated to note!");
        await fetchNotes();
      }
    }
    setStepStart(null);
  };

  // {Pedometer Permission and Subscription}
  useEffect(() => {
    let subscription: any;
    const subscribe = async () => {
      // Check permission status first
      const perm = await Pedometer.getPermissionsAsync();
      setPermissionStatus(perm.status);
      if (!perm.granted) {
        setIsPedometerAvailable("Permission denied");
        Alert.alert(
          "Pedometer Permission Required",
          "Please allow pedometer access in your device settings to use this feature."
        );
        return;
      }
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable ? "Yes" : "No");
      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 1);
        const pastStepCountResult = await Pedometer.getStepCountAsync(
          start,
          end
        );
        if (pastStepCountResult) {
          setPastStepCount(pastStepCountResult.steps);
        }
        subscription = Pedometer.watchStepCount((result) => {
          setCurrentStepCount(result.steps);
        });
      }
    };
    subscribe();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // {Update stepCounted when noteList or selectedNoteId changes}
  useEffect(() => {
    const updateStepCounted = () => {
      if (selectedNoteId) {
        const note = getSelectedNote();
        if (note) {
          setStepCounted(note.stepCount ?? 0);
        }
      }
    };
    updateStepCounted();
  }, [noteList, selectedNoteId]);

  // {UI Render}
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-primary text-2xl font-bold mb-2">
          Step Counter
        </Text>
        {/* Note Steps Info */}
        <View className="bg-surface rounded-xl p-4 w-full items-center mb-2">
          <Text className="text-primary text-base font-semibold">
            Note Steps
          </Text>
          <Text className="text-accent text-3xl font-bold mt-1">
            {stepCounted}
          </Text>
        </View>
        {/* Current Steps Info */}
        <View className="bg-surface rounded-xl p-4 w-full items-center mb-4">
          <Text className="text-primary text-base font-semibold">
            Current Steps
          </Text>
          <Text className="text-orange text-3xl font-bold mt-1">
            {isCounting && stepStart !== null ? getSessionSteps() : 0}
          </Text>
        </View>
        {/* Note Picker Dropdown */}
        <View className="w-full mb-4">
          <Text className="text-primary text-base mb-2">Pick a note</Text>
          <View className="bg-surface rounded-lg border border-accent">
            <Picker
              selectedValue={selectedNoteId}
              onValueChange={(itemValue) => setSelectedNoteId(itemValue)}
              style={{ width: "100%", color: "#1b130d" }}
            >
              <Picker.Item label="Pick a note..." value="" />
              {noteList.map((note) => (
                <Picker.Item
                  key={note.id}
                  label={note.title}
                  value={note.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>
        {/* Action Buttons Row */}
        <View className="flex-row gap-4 mt-6 w-full">
          {!isCounting ? (
            <TouchableOpacity
              className="flex-1 bg-orange rounded-lg py-3 items-center"
              onPress={startCounting}
            >
              <Text className="text-white text-base font-bold">Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 bg-accent rounded-lg py-3 items-center"
              onPress={handleStopCounting}
            >
              <Text className="text-white text-base font-bold">Stop</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className={`flex-1 bg-surface rounded-lg py-3 items-center border border-accent ml-2 ${
              isCounting || stepCounted === 0 ? "opacity-50" : ""
            }`}
            onPress={resetCounting}
            disabled={isCounting || stepCounted === 0}
          >
            <Text className="text-accent text-base font-bold">Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StepCounterScreen;

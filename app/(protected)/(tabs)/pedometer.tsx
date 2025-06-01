import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "expo-router";
import { Pedometer } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { eq } from "../../db/db";
import { notes } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

const StepCounterScreen = () => {
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

  const startCounting = () => {
    setIsCounting(true);
    // Simpan stepCounted saat ini sebagai base
    const baseStepCounted = stepCounted;
    setStepStart(currentStepCount);
    if (subscriptionRef.current) subscriptionRef.current.remove();
    subscriptionRef.current = Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps);
      if (stepStart !== null) {
        // Tambahkan langkah baru ke stepCounted sebelumnya
        setStepCounted(baseStepCounted + (result.steps - stepStart));
      } else {
        setStepCounted(baseStepCounted);
      }
    });
  };

  // Update noteList setelah stopCounting
  const stopCounting = async () => {
    setIsCounting(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (selectedNoteId) {
      const note = noteList.find((n) => n.id.toString() === selectedNoteId);
      if (note) {
        // Hitung stepCounted secara langsung agar selalu akurat
        const counted = stepStart !== null ? currentStepCount - stepStart : 0;
        await db
          .update(notes)
          .set({ stepCount: counted })
          .where(eq(notes.id, note.id));
        // Update state agar user lihat hasil terbaru
        setStepCounted(counted);
        alert("Step berhasil disimpan ke note!");
        await fetchNotes(); // Tunggu update selesai sebelum refresh
      }
    }
  };

  const resetCounting = () => {
    if (isCounting) return;
    if (stepCounted === 0) return;
    // Konfirmasi sebelum reset
    if (window.confirm) {
      if (!window.confirm("Yakin ingin reset langkah?")) return;
    } else if (global.confirm) {
      if (!global.confirm("Yakin ingin reset langkah?")) return;
    } else {
      if (!confirm("Yakin ingin reset langkah?")) return;
    }
    setStepStart(null);
    setStepCounted(0);
    setIsCounting(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  };

  // Fetch notes milik user
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

  const handleSaveStepToNote = async () => {
    if (!selectedNote) return;
    await db
      .update(notes)
      .set({ stepCount: stepCounted })
      .where(eq(notes.id, selectedNote.id));
    setModalVisible(false);
    setSelectedNote(null);
    setStepCounted(0);
    alert("Step berhasil disimpan ke note!");
  };

  useEffect(() => {
    let subscription: any;
    const subscribe = async () => {
      // Check permission status first
      const perm = await Pedometer.getPermissionsAsync();
      setPermissionStatus(perm.status);
      if (!perm.granted) {
        const req = await Pedometer.requestPermissionsAsync();
        setPermissionStatus(req.status);
        if (!req.granted) {
          setIsPedometerAvailable("Permission denied");
          return;
        }
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

  // Refresh dropdown stepCount jika noteList berubah
  useEffect(() => {
    // Jika note yang dipilih ada di noteList, update stepCounted sesuai stepCount note
    if (selectedNoteId) {
      const note = noteList.find((n) => n.id.toString() === selectedNoteId);
      if (note) {
        setStepCounted(note.stepCount ?? 0);
      }
    }
  }, [noteList, selectedNoteId]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-primary text-2xl font-bold mb-2">
          Step Counter
        </Text>
        {/* Info Note Steps */}
        <View className="bg-surface rounded-xl p-4 w-full items-center mb-2">
          <Text className="text-primary text-base font-semibold">
            Note Steps
          </Text>
          <Text className="text-accent text-3xl font-bold mt-1">
            {stepCounted}
          </Text>
        </View>
        {/* Info Current Steps */}
        <View className="bg-surface rounded-xl p-4 w-full items-center mb-4">
          <Text className="text-primary text-base font-semibold">
            Current Steps
          </Text>
          <Text className="text-orange text-3xl font-bold mt-1">
            {isCounting && stepStart !== null
              ? Math.max(0, currentStepCount - stepStart)
              : 0}
          </Text>
        </View>
        {/* Dropdown Pilih Note */}
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
                  label={`${note.title} (${note.stepCount ?? 0} steps)`}
                  value={note.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>
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
              onPress={async () => {
                setIsCounting(false);
                if (subscriptionRef.current) {
                  subscriptionRef.current.remove();
                  subscriptionRef.current = null;
                }
                if (selectedNoteId) {
                  const note = noteList.find(
                    (n) => n.id.toString() === selectedNoteId
                  );
                  if (note) {
                    // Akumulasi step: note.stepCount sebelumnya + langkah sesi ini
                    const sessionSteps =
                      stepStart !== null ? currentStepCount - stepStart : 0;
                    const newStepCount = (note.stepCount ?? 0) + sessionSteps;
                    await db
                      .update(notes)
                      .set({ stepCount: newStepCount })
                      .where(eq(notes.id, note.id));
                    setStepCounted(newStepCount);
                    alert("Step berhasil diakumulasikan ke note!");
                    await fetchNotes();
                  }
                }
                setStepStart(null);
              }}
            >
              <Text className="text-white text-base font-bold">Stop</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className={`flex-1 bg-surface rounded-lg py-3 items-center border border-accent ml-2 ${
              isCounting ? "" : "opacity-50"
            }`}
            onPress={resetCounting}
            disabled={!isCounting}
          >
            <Text className="text-accent text-base font-bold">Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StepCounterScreen;

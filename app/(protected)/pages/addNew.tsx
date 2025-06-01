import { desc } from "drizzle-orm";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import ImagePickerField from "../../components/ImagePickerField";
import LocationPickerField from "../../components/LocationPickerField";
import ReminderList from "../../components/ReminderList";
import db from "../../db/db";
import { notes, reminders } from "../../db/schema";
import { locationEventEmitter } from "../../services/locationEvents";
import { useAuth } from "../../utils/authContext";
import { copyImageToAppDir } from "../../utils/image";
import { reverseGeocode } from "../../utils/location";

export default function AddNewScreen() {
  const router = useRouter();
  const { user } = useAuth(); // <--- Ambil user dari context
  const params = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [remindersState, setReminders] = useState<Date[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Ambil lokasi saat ini saat komponen mount
  React.useEffect(() => {
    const getLocation = async () => {
      setLocLoading(true);
      try {
        const { status } = await (
          await import("expo-location")
        ).requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          setLocLoading(false);
          return;
        }
        const loc = await (
          await import("expo-location")
        ).getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        Alert.alert("Error", "Failed to get location.");
      } finally {
        setLocLoading(false);
      }
    };

    // Only fetch current GPS location if no location was passed via params
    // from the selectLocation screen.
    if (
      params.selectedLatitude === undefined &&
      params.selectedLongitude === undefined
    ) {
      getLocation();
    }
  }, []);

  // Update location if returned from selectLocation
  React.useEffect(() => {
    const lat = Number(params.selectedLatitude);
    const lng = Number(params.selectedLongitude);
    if (
      params.selectedLatitude !== undefined &&
      params.selectedLongitude !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng)
    ) {
      setLocation({
        latitude: lat,
        longitude: lng,
      });
    }
  }, [params.selectedLatitude, params.selectedLongitude]);

  // Reverse geocoding setiap kali location berubah
  React.useEffect(() => {
    const getAddress = async () => {
      if (location) {
        setAddress(await reverseGeocode(location));
      } else {
        setAddress("");
      }
    };
    getAddress();
  }, [location]);

  // Listen for locationSelected event from locationEventEmitter
  React.useEffect(() => {
    // @ts-ignore: event name is dynamic
    const sub = locationEventEmitter.addListener(
      // @ts-ignore
      "locationSelected",
      (loc: { latitude: number; longitude: number }) => {
        setLocation(loc);
      }
    );
    return () => sub.remove();
  }, []);

  // Pick image and save to local file system
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      try {
        const newPath = await copyImageToAppDir(pickedUri);
        setImage(newPath);
      } catch (e) {
        Alert.alert("Error", "File system not available.");
      }
    }
  };

  // Handler untuk menambah reminder
  const handleAddReminder = () => {
    setDatePickerValue(new Date());
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    if (!remindersState.some((r) => r.getTime() === date.getTime())) {
      setReminders([...remindersState, date]);
    }
    hideDatePicker();
  };

  // Remove reminder by index
  const handleRemoveReminder = (idx: number) => {
    setReminders(remindersState.filter((_, i) => i !== idx));
  };

  // Save note to DB
  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }
    // Request notification permission
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Notification permission is required to set reminders."
      );
      return;
    }
    if (
      !title.trim() ||
      !description.trim() ||
      !image ||
      !location ||
      !address
    ) {
      Alert.alert(
        "Missing Fields",
        "Please fill all fields, add an image, and set location."
      );
      return;
    }
    setSaving(true);
    try {
      // Simpan note
      await db.insert(notes).values({
        userId: user.id, // <--- Simpan userId
        title,
        description,
        imagePath: image,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        createdAt: new Date().toISOString(),
      });
      // Ambil id note yang baru
      const lastNote = await db
        .select()
        .from(notes)
        .orderBy(desc(notes.id))
        .limit(1)
        .get();
      const noteId = lastNote?.id;
      // Simpan reminders ke tabel reminders
      if (noteId && remindersState.length > 0) {
        for (const reminderDate of remindersState) {
          await db.insert(reminders).values({
            noteId,
            reminderAt: reminderDate.toISOString(),
            createdAt: new Date().toISOString(),
          });
          // Jadwalkan notifikasi
          try {
            const notifResult = await Notifications.scheduleNotificationAsync({
              content: {
                title: `Reminder: ${title}`,
                body: description,
                data: { noteId }, // <--- Tambahkan noteId ke data
              },
              trigger: {
                date: reminderDate,
                type: Notifications.SchedulableTriggerInputTypes.DATE,
              },
            });
          } catch (e) {
            console.log("Failed to schedule notification:", e);
          }
        }
      }
      setSaving(false);
      router.back();
    } catch (err) {
      setSaving(false);
      Alert.alert("Error", "Failed to save note.");
      console.error(err);
    }
  };

  // Navigasi ke page selectLocation
  const handlePickLocation = () => {
    router.push({
      pathname: "/pages/modal.selectLocation",
      params: location
        ? { latitude: location.latitude, longitude: location.longitude }
        : {},
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={"padding"}>
      <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Image Upload Area */}
            <View className="px-4">
              <ImagePickerField
                image={image}
                onPick={pickImage}
                editable={!saving}
              />
            </View>
            {/* Title Input */}
            <View className="px-4 pt-2">
              <TextInput
                placeholder="Trip title"
                placeholderTextColor="#a97c5a"
                className="w-full rounded-2xl bg-surface-light text-accent-light text-lg font-medium p-4 mb-4"
                style={{ minHeight: 56 }}
                value={title}
                onChangeText={setTitle}
                maxLength={20}
              />
            </View>
            {/* Note Input */}
            <View className="px-4">
              <TextInput
                placeholder="Write your note here..."
                placeholderTextColor="#a97c5a"
                className="w-full rounded-2xl bg-surface-light text-accent-light text-base font-normal p-4 mb-4"
                style={{ minHeight: 120, textAlignVertical: "top" }}
                multiline
                value={description}
                onChangeText={setDescription}
              />
              {/* Lokasi */}
              <LocationPickerField
                address={address}
                loading={locLoading}
                onPick={handlePickLocation}
                disabled={locLoading}
              />
            </View>
            {/* Add to your note */}
            <Text className="px-4 pt-4 pb-2 text-lg font-bold text-primary">
              Add to your note
            </Text>
            <View className="gap-4 px-4">
              {/* Add reminder */}
              <TouchableOpacity
                className="flex-row items-center mb-2"
                onPress={handleAddReminder}
              >
                <View className="size-12 rounded-xl bg-surface-light items-center justify-center mr-4">
                  <Bell size={28} color="#1b130d" weight="regular" />
                </View>
                <Text className="text-base text-accent">Add reminder</Text>
              </TouchableOpacity>
              {/* List reminders */}
              <ReminderList
                reminders={remindersState}
                onRemove={handleRemoveReminder}
              />
              {/* Add created date below reminders */}
              <View className="flex mb-2">
                <Text className="text-base text-accent">
                  Created At:{" "}
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
              {/* DateTimePicker */}
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                date={datePickerValue}
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        {/* Save Button */}
        <View className="px-4 pb-6 pt-2 bg-transparent">
          <TouchableOpacity
            className="w-full h-14 rounded-2xl bg-orange-dark items-center justify-center"
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="text-white text-lg font-bold">
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

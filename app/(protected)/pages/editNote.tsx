import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import db, { eq } from "../../db/db";
import { notes, reminders } from "../../db/schema";
import { locationEventEmitter } from "../../services/locationEvents";
import { useAuth } from "../../utils/authContext";
import { copyImageToAppDir } from "../../utils/image";
import { getTimezoneFromCoords, reverseGeocode } from "../../utils/location";

const EditNote = () => {
  const router = useRouter();
  const { user } = useAuth(); // <--- Ambil user dari context
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<{
    id: number;
    userId: number; // <--- Tambah userId ke tipe note
    imagePath: string;
    title: string;
    description: string;
    latitude?: number | null;
    longitude?: number | null;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [remindersState, setReminders] = useState<Date[]>([]);
  const [reminderIds, setReminderIds] = useState<number[]>([]);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  const [timezone, setTimezone] = useState<string>("Asia/Jakarta");

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const result = await db
          .select()
          .from(notes)
          .where(eq(notes.id, Number(id)))
          .get();
        if (result) {
          if (!user || result.userId !== user.id) {
            setNote(null);
            setLoading(false);
            Alert.alert("Forbidden", "You are not allowed to edit this note.", [
              { text: "OK", onPress: () => router.replace("/home") },
            ]);
            return;
          }
          setNote(result);
          setTitle(result.title);
          setDescription(result.description);
          setImage(result.imagePath);
          setLatitude(result.latitude ?? null);
          setLongitude(result.longitude ?? null);
          setAddress(result.address ?? "");
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load note.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNote();
  }, [id, user]);

  // Handle location returned from selectLocation
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.selectedLatitude && params.selectedLongitude) {
      const lat = Number(params.selectedLatitude);
      const lng = Number(params.selectedLongitude);
      setLatitude(lat);
      setLongitude(lng);
      // Get address for new lat/lng
      (async () => {
        try {
          const res = await Location.reverseGeocodeAsync({
            latitude: lat,
            longitude: lng,
          });
          if (res && res.length > 0) {
            const a = res[0];
            setAddress(
              [a.name, a.street, a.city, a.region, a.country]
                .filter(Boolean)
                .join(", ")
            );
          } else {
            setAddress("");
          }
        } catch {
          setAddress("");
        }
      })();
    } else if (id && !note) {
      // Only fetch note if not already loaded and no new location is passed
      // Initial fetch of note data, which includes its saved location
      // This part remains the same, as it's for loading existing note data
      const fetchNote = async () => {
        setLoading(true);
        try {
          const result = await db
            .select()
            .from(notes)
            .where(eq(notes.id, Number(id)))
            .get();
          if (result) {
            setNote(result);
            setTitle(result.title);
            setDescription(result.description);
            setImage(result.imagePath);
            // Set lat/lng from fetched note only if not overridden by params
            if (!params.selectedLatitude && !params.selectedLongitude) {
              setLatitude(result.latitude ?? null);
              setLongitude(result.longitude ?? null);
              setAddress(result.address ?? "");
            }
          }
        } catch (err) {
          Alert.alert("Error", "Failed to load note.");
        } finally {
          setLoading(false);
        }
      };
      fetchNote();
    }
  }, [id, params.selectedLatitude, params.selectedLongitude, note]); // Added note to dependency array

  // Reverse geocode if address is missing but lat/lng exist (e.g. after param update)
  useEffect(() => {
    const updateAddress = async () => {
      if ((!address || address === "") && latitude && longitude) {
        setAddress(await reverseGeocode({ latitude, longitude }));
      }
    };
    updateAddress();
  }, [latitude, longitude, address]);

  // Update location if returned from selectLocation modal
  useEffect(() => {
    if (
      params.selectedLatitude !== undefined &&
      params.selectedLongitude !== undefined
    ) {
      const lat = Number(params.selectedLatitude);
      const lng = Number(params.selectedLongitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLatitude(lat);
        setLongitude(lng);
      }
    }
  }, [params.selectedLatitude, params.selectedLongitude]);

  // Listen for locationSelected events
  useEffect(() => {
    // @ts-ignore
    const sub = (locationEventEmitter as any).addListener(
      "locationSelected",
      (loc: { latitude: number; longitude: number }) => {
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        // Langsung update address setelah lokasi berubah
        (async () => {
          try {
            const res = await Location.reverseGeocodeAsync({
              latitude: loc.latitude,
              longitude: loc.longitude,
            });
            if (res && res.length > 0) {
              const a = res[0];
              setAddress(
                [a.name, a.street, a.city, a.region, a.country]
                  .filter(Boolean)
                  .join(", ")
              );
            } else {
              setAddress("");
            }
          } catch {
            setAddress("");
          }
        })();
      }
    );
    return () => sub.remove();
  }, []);

  // Pick location handler
  const handlePickLocation = () => {
    router.push({
      pathname: "/pages/modal.selectLocation",
      params: latitude && longitude ? { latitude, longitude } : {},
    });
  };

  // Function to pick and update image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
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

  const handleSave = async () => {
    // Cek izin lokasi
    try {
      const { status } = await (
        await import("expo-location")
      ).requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please allow location access in your device settings to use this feature."
        );
        return;
      }
    } catch (e) {
      // Jika modul tidak ditemukan, abaikan
    }
    // Tidak perlu cek/minta izin notifikasi di sini
    if (!user || (note && note.userId !== user.id)) {
      Alert.alert("Forbidden", "You are not allowed to edit this note.");
      return;
    }
    setSaving(true);
    try {
      await db
        .update(notes)
        .set({
          title,
          description,
          imagePath: image ?? note?.imagePath,
          latitude: latitude,
          longitude: longitude,
          address: address,
          createdTimezone: timezone, // Ganti ke field yang benar
        })
        .where(eq(notes.id, Number(id)));
      Alert.alert("Success", "Note updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || (note && note.userId !== user.id)) {
      Alert.alert("Forbidden", "You are not allowed to delete this note.");
      return;
    }
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            // Cancel semua notification terkait note ini
            const reminderRows = await db
              .select()
              .from(reminders)
              .where(eq(reminders.noteId, Number(id)))
              .all();
            for (const r of reminderRows) {
              if (r.notificationId) {
                try {
                  await Notifications.cancelScheduledNotificationAsync(
                    r.notificationId
                  );
                } catch {}
              }
            }
            await db.delete(notes).where(eq(notes.id, Number(id)));
            Alert.alert("Deleted", "Note deleted.", [
              { text: "OK", onPress: () => router.replace("/home") },
            ]);
          } catch (err) {
            Alert.alert("Error", "Failed to delete note.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchReminders = async () => {
      if (id) {
        const reminderRows = await db
          .select()
          .from(reminders)
          .where(eq(reminders.noteId, Number(id)))
          .all();
        setReminders(reminderRows.map((r) => new Date(r.reminderAt)));
        setReminderIds(reminderRows.map((r) => r.id));
      }
    };
    const fetchNoteCreatedAt = async () => {
      if (id) {
        const noteRow = await db
          .select()
          .from(notes)
          .where(eq(notes.id, Number(id)))
          .get();
        setCreatedAt(noteRow?.createdAt || "");
      }
    };
    fetchReminders();
    fetchNoteCreatedAt();
  }, [id]);

  const handleAddReminder = async () => {
    // Cek izin notifikasi sebelum buka date picker
    const notifPerm = await Notifications.getPermissionsAsync();
    if (notifPerm.status !== "granted") {
      const requestPerm = await Notifications.requestPermissionsAsync();
      if (requestPerm.status !== "granted") {
        Alert.alert(
          "Notification Permission Required",
          "Please allow notification access in your device settings to set reminders."
        );
        return;
      }
    }
    setDatePickerValue(new Date());
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = async (date: Date) => {
    if (!remindersState.some((r) => r.getTime() === date.getTime())) {
      // Insert to DB
      if (id) {
        let notificationId = null;
        try {
          notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `Reminder: ${title}`,
              body: description,
              data: { noteId: id },
            },
            trigger: {
              date,
              type: Notifications.SchedulableTriggerInputTypes.DATE,
            },
          });
        } catch (e) {
          console.log("Failed to schedule notification (edit):", e);
        }
        await db.insert(reminders).values({
          noteId: Number(id),
          reminderAt: date.toISOString(),
          createdAt: new Date().toISOString(),
          notificationId: notificationId || null,
        });
        // Re-fetch reminders
        const reminderRows = await db
          .select()
          .from(reminders)
          .where(eq(reminders.noteId, Number(id)))
          .all();
        setReminders(reminderRows.map((r) => new Date(r.reminderAt)));
        setReminderIds(reminderRows.map((r) => r.id));
      }
    }
    hideDatePicker();
  };
  const handleRemoveReminder = async (idx: number) => {
    if (reminderIds[idx]) {
      // Ambil notificationId sebelum delete
      const reminderRow = await db
        .select()
        .from(reminders)
        .where(eq(reminders.id, reminderIds[idx]))
        .get();
      if (reminderRow?.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(
            reminderRow.notificationId
          );
        } catch {}
      }
      await db.delete(reminders).where(eq(reminders.id, reminderIds[idx]));
      // Re-fetch reminders
      if (id) {
        const reminderRows = await db
          .select()
          .from(reminders)
          .where(eq(reminders.noteId, Number(id)))
          .all();
        setReminders(reminderRows.map((r) => new Date(r.reminderAt)));
        setReminderIds(reminderRows.map((r) => r.id));
      }
    }
  };

  // Update timezone otomatis saat lokasi berubah
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      try {
        const tz = getTimezoneFromCoords(latitude, longitude);
        setTimezone(tz);
      } catch {
        setTimezone("Asia/Jakarta");
      }
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  if (!note) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-primary">Note not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={"padding"}>
      <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-background-light p-4">
              {/* Image Edit Area */}
              <ImagePickerField
                image={image ?? note?.imagePath ?? null}
                onPick={pickImage}
                editable={!saving && !deleting}
              />
              <Text className="text-primary text-lg font-bold mb-2">Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                className="w-full rounded-2xl bg-surface-light text-accent-light text-lg font-medium p-4 mb-4"
                style={{ minHeight: 56 }}
                editable={!saving && !deleting}
                maxLength={40}
              />
              <Text className="text-primary text-lg font-bold mb-2">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="w-full rounded-2xl bg-surface-light text-accent-light text-base font-normal p-4 mb-4"
                style={{ minHeight: 120, textAlignVertical: "top" }}
                multiline
                editable={!saving && !deleting}
              />
              <LocationPickerField
                address={address}
                loading={false}
                onPick={handlePickLocation}
                disabled={saving || deleting}
              />
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
              <View className="flex-row items-center mb-2 mt-2">
                <Text className="text-base text-accent">
                  Created At:{" "}
                  {createdAt
                    ? new Date(createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: user?.timezone || "Asia/Jakarta",
                      })
                    : "-"}
                </Text>
              </View>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                date={datePickerValue}
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
              />
              <View className="flex-row justify-between mt-6">
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-orange rounded-l-xl px-6 py-3 w-[50%] items-center"
                  disabled={saving || deleting}
                >
                  <Text className="text-white text-base font-bold">
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-accent rounded-r-xl px-6 py-3 w-[50%] items-center"
                  disabled={saving || deleting}
                >
                  <Text className="text-white text-base font-bold">
                    {deleting ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditNote;

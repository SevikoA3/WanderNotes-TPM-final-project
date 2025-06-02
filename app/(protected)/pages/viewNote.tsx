import { eq } from "drizzle-orm";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReminderList from "../../components/ReminderList";
import db from "../../db/db";
import { notes, reminders } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

type Note = {
  id: number;
  imagePath: string | null;
  title: string;
  description: string;
  address: string | null;
  stepCount?: number;
};

const ViewNoteScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [remindersState, setReminders] = useState<Date[]>([]);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [createdTimezone, setCreatedTimezone] = useState<string>("");
  const [userTimezone, setUserTimezone] = useState<string>("");
  const navigation = useNavigation();
  const { user } = useAuth();

  // Refactor fetchNote supaya bisa dipakai di event focus
  const fetchNote = useCallback(async () => {
    if (id) {
      setLoading(true);
      try {
        const noteId = parseInt(id, 10);
        const result = await db
          .select()
          .from(notes)
          .where(eq(notes.id, noteId))
          .get();
        if (result) {
          setNote({
            id: result.id,
            imagePath: result.imagePath,
            title: result.title,
            description: result.description,
            address: result.address,
            stepCount: result.stepCount ?? 0,
          });
          setCreatedTimezone(result.createdTimezone || "UTC");
          // Ambil timezone user terbaru dari DB
          const userRow = await db
            .select()
            .from(require("../../db/schema").users)
            .where(eq(require("../../db/schema").users.id, result.userId))
            .get();
          setUserTimezone(userRow?.timezone || "Asia/Jakarta");
        } else {
          setNote(null);
        }
        // Fetch reminders and createdAt after note is loaded
        const reminderRows = await db
          .select()
          .from(reminders)
          .where(eq(reminders.noteId, noteId))
          .all();
        setReminders(reminderRows.map((r) => new Date(r.reminderAt)));
        setCreatedAt(result?.createdAt || "");
      } catch (err) {
        console.error("Failed to fetch note:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  // Hapus useEffect, ganti dengan useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      fetchNote();
    }, [fetchNote])
  );

  useEffect(() => {
    if (note?.title) {
      navigation.setOptions({ title: note.title });
    }
  }, [note?.title, navigation]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#FF6347" />
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-primary text-lg">Note not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView className="flex-1">
        <View className="pb-4">
          {/* Card utama note */}
          <View className="bg-white/90 rounded-2xl shadow-md mx-4 mt-4 mb-4 p-0 overflow-hidden">
            {note.imagePath ? (
              <Image
                source={{ uri: note.imagePath }}
                className="w-full h-56 object-cover rounded-t-2xl"
                resizeMode="cover"
              />
            ) : null}
            <View className="p-4">
              {/* Tanggal & timezone */}
              <View className="flex-row items-center mb-2">
                <View className="bg-surface/80 rounded-lg px-3 py-2 w-full flex-row items-center gap-2">
                  <Text className="text-accent text-lg mr-1">🕒</Text>
                  {createdAt &&
                  createdTimezone &&
                  userTimezone &&
                  userTimezone !== createdTimezone ? (
                    <View>
                      <Text className="text-accent text-base font-semibold">
                        {createdTimezone}:{" "}
                        {new Date(createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: createdTimezone,
                        })}
                      </Text>
                      <Text className="text-accent text-base font-semibold mt-1">
                        {userTimezone}:{" "}
                        {new Date(createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: userTimezone,
                        })}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-accent text-base font-semibold">
                      {createdAt
                        ? new Date(createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone:
                              userTimezone || createdTimezone || "Asia/Jakarta",
                          })
                        : "-"}
                    </Text>
                  )}
                </View>
              </View>
              {/* Lokasi & step count */}
              <View className="mb-2">
                {note.address ? (
                  <View className="flex-row items-center bg-surface/60 rounded-lg px-2 py-1 mb-2">
                    <Text className="text-accent text-lg mr-1">📍</Text>
                    <Text className="text-accent text-base">
                      {note.address}
                    </Text>
                  </View>
                ) : null}
                <View className="flex-row items-center bg-surface/60 rounded-lg px-2 py-1">
                  <Text className="text-accent text-lg mr-1">👣</Text>
                  <Text className="text-accent text-base">
                    {note.stepCount ?? 0} steps
                  </Text>
                </View>
              </View>
              {/* Deskripsi note */}
              <Text className="text-primary text-lg leading-relaxed mt-2 mb-4">
                {note.description}
              </Text>
              {/* List reminders */}
              <ReminderList
                reminders={remindersState}
                removable={false}
                className="mt-2"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Tombol Edit Note sticky di bawah */}
      <View className="p-4 border-t border-surface bg-white/90">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/pages/editNote",
              params: { id: note.id },
            })
          }
          className="bg-orange rounded-lg py-4 items-center justify-center shadow-md"
          activeOpacity={0.85}
        >
          <Text className="text-white text-lg font-semibold">Edit Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ViewNoteScreen;

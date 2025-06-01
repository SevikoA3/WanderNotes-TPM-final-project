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
          {note.imagePath ? (
            <View className="p-4">
              <Image
                source={{ uri: note.imagePath }}
                className="w-full rounded-lg h-64 mb-4"
                resizeMode="cover"
              />
            </View>
          ) : null}
          {/* Created date above address, no calendar icon, with time */}
          {createdAt &&
          createdTimezone &&
          userTimezone &&
          userTimezone !== createdTimezone ? (
            <View className="mx-4 mb-2">
              <Text className="text-base text-accent">
                ({createdTimezone}):{" "}
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
              <Text className="text-base text-accent mt-1">
                ({userTimezone}):{" "}
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
            <Text className="text-base text-accent mx-4 mb-2">
              {createdAt
                ? new Date(createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: userTimezone || createdTimezone || "Asia/Jakarta",
                  })
                : "-"}
            </Text>
          )}
          {/* Lokasi di bawah tanggal */}
          {note.address ? (
            <Text className="text-accent text-s mx-4 mb-2">{note.address}</Text>
          ) : null}
          {/* Step Count */}
          <Text className="text-accent text-base mx-4 mb-2">
            Steps: {note.stepCount ?? 0}
          </Text>
          <Text className="text-primary text-base leading-relaxed m-4">
            {note.description}
          </Text>
          {/* List reminders */}
          <ReminderList
            reminders={remindersState}
            removable={false}
            className="mx-4"
          />
        </View>
      </ScrollView>
      <View className="p-4 border-t border-surface">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/pages/editNote",
              params: { id: note.id },
            })
          }
          className="bg-orange rounded-lg py-4 items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">Edit Note</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ViewNoteScreen;

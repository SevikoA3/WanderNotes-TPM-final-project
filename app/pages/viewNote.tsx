import { eq } from "drizzle-orm";
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db from "../db/db";
import { notes } from "../db/schema";

type Note = {
  id: number;
  imagePath: string | null;
  title: string;
  description: string;
  address: string | null;
};

const ViewNoteScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Refactor fetchNote supaya bisa dipakai di event focus
  const fetchNote = useCallback(async () => {
    if (id) {
      setLoading(true);
      try {
        const noteId = parseInt(id, 10);
        const result = await db.select().from(notes).where(eq(notes.id, noteId)).get();
        setNote(result || null);
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
            <Image source={{ uri: note.imagePath }} className="w-full h-64 mb-4" resizeMode="cover" />
          ) : null}
          {/* Lokasi di bawah gambar */}
          {note.address ? <Text className="text-accent text-s mx-4 mb-2">{note.address}</Text> : null}
          <Text className="text-accent text-base leading-relaxed m-4">{note.description}</Text>
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

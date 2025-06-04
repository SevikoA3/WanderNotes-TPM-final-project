import { useFocusEffect, useRouter } from "expo-router";
import { MagnifyingGlass, Plus } from "phosphor-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NoteCard from "../../components/NoteCard";
import db, { eq } from "../../db/db";
import { notes } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

type Note = {
  id: number;
  imagePath: string;
  title: string;
  description: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth(); // <--- Ambil user dari context
  const [noteList, setNoteList] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchNotes = async () => {
        setLoading(true);
        try {
          if (!user) return;
          const allNotes = await db
            .select()
            .from(notes)
            .where(eq(notes.userId, user.id)) // <--- Filter by userId
            .all();
          if (isActive) setNoteList(allNotes);
        } catch (err) {
          console.error("Failed to fetch notes:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchNotes();
      return () => {
        isActive = false;
      };
    }, [user]) // <--- Tambah user ke dependency
  );

  // Filter notes by search
  const filteredNotes = noteList.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 grow"
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header */}
        <View className="bg-background">
          <View className="flex-row items-center p-4 pb-2 justify-between">
            {/* Spacer for centering title */}
            <View className="w-12" />
            <Text className="text-primary text-2xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
              WanderNotes
            </Text>
            <View className="flex w-12 items-center justify-end" />
          </View>
          {/* Search Bar */}
          <View className="px-4 py-3">
            <View className="flex-row items-center rounded-xl h-12 w-full bg-surface overflow-hidden">
              <View className="items-center justify-center pl-4 pr-2">
                <MagnifyingGlass size={24} color="#9a6b4c" />
              </View>
              <TextInput
                placeholder="Search"
                className="flex-1 h-full placeholder:text-accent text-base font-normal leading-normal pl-2"
                placeholderTextColor="#9a6b4c"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>
        </View>
        {/* Content Section */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#1b130d" />
          </View>
        ) : filteredNotes.length === 0 ? (
          <View className="flex-1 items-center justify-center w-full">
            <Text className="text-lg text-accent text-center">
              No notes yet.{"\n"}Tap the + button to add your first note.
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-between">
            {/* Top Section */}
            <View>
              {/* Content Cards */}
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id || index}
                  note={note}
                  onPress={() =>
                    router.push({
                      pathname: "/pages/viewNote",
                      params: { id: note.id },
                    })
                  }
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {/* Floating Plus Button */}
      <TouchableOpacity
        onPress={() => router.push("/pages/addNote")}
        className="absolute bottom-8 right-6 bg-orange rounded-full w-16 h-16 items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Plus size={32} color="#fdf9f6" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

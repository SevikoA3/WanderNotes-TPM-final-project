import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { MagnifyingGlass, Plus } from "phosphor-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db from "../db/db";
import { notes } from "../db/schema";

type Note = {
  id: number;
  imagePath: string;
  title: string;
  description: string;
};

const HomeScreen = () => {
  const router = useRouter();
  const [noteList, setNoteList] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchNotes = async () => {
        setLoading(true);
        try {
          const allNotes = await db.select().from(notes).all();
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
    }, [])
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
        className="flex-1"
        stickyHeaderIndices={[0]}
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
        <View className="flex-1 justify-between">
          {/* Top Section */}
          <View>
            {/* Content Cards */}
            {loading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#FF6347" />
              </View>
            ) : (
              filteredNotes.map((note, index) => (
                <TouchableOpacity
                  key={note.id || index}
                  onPress={() =>
                    router.push({
                      pathname: "/components/editNote",
                      params: { id: note.id },
                    })
                  }
                  activeOpacity={0.85}
                  className="p-4"
                >
                  <View className="flex-col rounded-xl xl:flex-row xl:items-start bg-white shadow-sm overflow-hidden">
                    <ImageBackground
                      source={{ uri: note.imagePath }}
                      className="w-full aspect-[16/9] xl:w-1/3"
                      resizeMode="cover"
                    />
                    <View className="w-full xl:w-2/3 grow flex-col items-stretch justify-center gap-1 p-4">
                      <Text className="text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
                        {note.title}
                      </Text>
                      <View className="flex-row items-end gap-3 justify-between mt-1">
                        <Text className="text-accent text-base font-normal leading-normal">
                          {note.description.length > 80
                            ? note.description.slice(0, 80) + "..."
                            : note.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      {/* Floating Plus Button */}
      <TouchableOpacity
        onPress={() => router.push("/components/addNew")}
        className="absolute bottom-8 right-6 bg-orange rounded-full w-16 h-16 items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Plus size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

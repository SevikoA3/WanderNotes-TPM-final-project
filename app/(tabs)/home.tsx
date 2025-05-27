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
  const [loading, setLoading] = useState(true); // <-- add loading state

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
    <SafeAreaView className="flex-1 bg-[#fcfaf8]" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between">
          {/* Top Section */}
          <View>
            {/* Header */}
            <View className="flex-row items-center bg-[#fcfaf8] p-4 pb-2 justify-between">
              {/* Spacer for centering title */}
              <View className="w-12" />
              <Text className="text-[#1b130d] text-2xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                WanderNotes
              </Text>
              <View className="flex w-12 items-center justify-end" />
            </View>

            {/* Search Bar */}
            <View className="px-4 py-3">
              <View className="flex-row items-center rounded-xl h-12 w-full bg-[#f3ece7] overflow-hidden">
                <View className="items-center justify-center pl-4 pr-2">
                  <MagnifyingGlass size={24} color="#9a6b4c" />
                </View>
                <TextInput
                  placeholder="Search"
                  className="flex-1 h-full placeholder:text-[#9a6b4c] text-base font-normal leading-normal pl-2"
                  placeholderTextColor="#9a6b4c"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>

            {/* Content Cards */}
            {loading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#FF6347" />
              </View>
            ) : (
              filteredNotes.map((note, index) => (
                <View key={note.id || index} className="p-4">
                  <View className="flex-col rounded-xl xl:flex-row xl:items-start bg-white shadow-sm overflow-hidden">
                    <ImageBackground
                      source={{ uri: note.imagePath }}
                      className="w-full aspect-[16/9] xl:w-1/3"
                      resizeMode="cover"
                    />
                    <View className="w-full xl:w-2/3 grow flex-col items-stretch justify-center gap-1 p-4">
                      <Text className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em]">
                        {note.title}
                      </Text>
                      <View className="flex-row items-end gap-3 justify-between mt-1">
                        <Text className="text-[#9a6b4c] text-base font-normal leading-normal">
                          {note.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      {/* Floating Plus Button */}
      <TouchableOpacity
        onPress={() => router.push("/components/addNew")}
        className="absolute bottom-8 right-6"
        style={{
          backgroundColor: "#FF6347",
          borderRadius: 32,
          width: 64,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
        activeOpacity={0.85}
      >
        <Plus size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

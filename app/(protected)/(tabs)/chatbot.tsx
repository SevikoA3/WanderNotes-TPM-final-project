import { useHeaderHeight } from "@react-navigation/elements";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { eq } from "../../db/db";
import { notes } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

const API_URL = process.env.EXPO_PUBLIC_CHAT_URL;

const ChatTab = () => {
  const { user } = useAuth();
  const [noteList, setNoteList] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<{ user: string; bot: string } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Fetch notes for current user
  const fetchNotes = async () => {
    if (!user) return;
    const allNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user.id))
      .all();
    setNoteList(allNotes);
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Format notes as context string
  const getNotesContext = () => {
    if (!noteList.length) return "No notes.";
    return noteList
      .map(
        (n) =>
          `id: ${n.id}, title: ${n.title}, desc: ${n.description}, address: ${
            n.address ?? "-"
          }, steps: ${n.stepCount ?? 0}`
      )
      .join("; ");
  };

  // Handle send
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    // Selalu fetch notes terbaru sebelum mengirim
    await fetchNotes();
    const context = getNotesContext();
    const messages = [
      {
        role: "user",
        text: `You are a helpful assistant that answers questions based on the user's notes. The app name is WanderNotes.`,
      },
      {
        role: "user",
        text: `User Context Notes: ${context}`,
      },
      {
        role: "user",
        text: `Question: ${input}`,
      },
    ];
    try {
      const res = await axios.post(API_URL ? API_URL : "", { messages });
      setChat({ user: input, bot: res.data.response });
      setInput("");
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      setChat({ user: input, bot: "Failed to get response." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={useHeaderHeight()}
    >
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <View className="height-full flex-1">
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 pt-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-end">
              {chat ? (
                <View className="mb-8">
                  <View className="mb-4 self-end max-w-[80%] bg-orange rounded-2xl px-4 py-3 shadow-md">
                    <Text className="text-white text-base font-medium">
                      {chat.user}
                    </Text>
                  </View>
                  <View className="self-start max-w-[85%] bg-white/90 rounded-2xl px-4 py-3 shadow-md border border-accent/10">
                    <Text className="text-primary text-base font-normal">
                      {chat.bot}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-1 items-center justify-center opacity-60">
                  <Text className="text-accent text-base">
                    Ask anything about your notes!
                  </Text>
                </View>
              )}
              {loading && (
                <View className="flex-row items-center justify-center mt-2">
                  <ActivityIndicator size="small" color="#FF6347" />
                  <Text className="ml-2 text-accent">
                    Waiting for response...
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          <View className="flex-row items-center px-4 pb-6 pt-2 bg-background">
            <TextInput
              className="flex-1 rounded-2xl bg-surface-light text-accent-light text-base font-normal p-4 mr-2 min-h-12"
              placeholder="Ask about your notes..."
              placeholderTextColor="#a97c5a"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              editable={!loading}
              returnKeyType="send"
            />
            <TouchableOpacity
              className="bg-orange-dark rounded-2xl px-5 py-3 items-center justify-center"
              onPress={handleSend}
              disabled={loading || !input.trim()}
              activeOpacity={0.85}
            >
              <Text className="text-white text-base font-bold">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatTab;

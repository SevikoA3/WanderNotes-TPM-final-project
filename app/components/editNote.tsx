import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db, { eq } from "../db/db";
import { notes } from "../db/schema";

const EditNote = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState<{
    id: number;
    imagePath: string;
    title: string;
    description: string;
  } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [image, setImage] = useState<string | null>(null);

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
          setNote(result);
          setTitle(result.title);
          setDescription(result.description);
          setImage(result.imagePath); // set image state
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load note.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNote();
  }, [id]);

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
      const fileName = pickedUri.split("/").pop() || `image_${Date.now()}.jpg`;
      if (!FileSystem.documentDirectory) {
        Alert.alert("Error", "File system not available.");
        return;
      }
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: pickedUri, to: newPath });
      setImage(newPath);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await db
        .update(notes)
        .set({ title, description, imagePath: image ?? note?.imagePath })
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
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await db.delete(notes).where(eq(notes.id, Number(id)));
            Alert.alert("Deleted", "Note deleted.", [
              { text: "OK", onPress: () => router.replace("/(tabs)/home") },
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
    <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 bg-background-light p-4">
          {/* Image Edit Area */}
          <TouchableOpacity
            className="w-full aspect-[16/9] rounded-xl mb-4 overflow-hidden"
            activeOpacity={0.8}
            onPress={pickImage}
            disabled={saving || deleting}
          >
            <View className="flex-1 w-full h-full">
              <ImageBackground
                source={{ uri: image ?? note.imagePath }}
                className="w-full h-full rounded-xl"
                imageStyle={{ borderRadius: 16 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.35)"]}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 16,
                  }}
                >
                  <View className="flex-1 justify-center items-center rounded-xl">
                    <Text className="text-white text-lg font-bold">
                      Click to edit
                    </Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text className="text-primary text-lg font-bold mb-2">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="w-full rounded-2xl bg-surface-light text-accent-light text-lg font-medium p-4 mb-4"
            style={{ minHeight: 56 }}
            editable={!saving && !deleting}
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
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity
              onPress={handleSave}
              className="bg-orange rounded-xl px-6 py-3"
              disabled={saving || deleting}
            >
              <Text className="text-white text-base font-bold">
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-accent rounded-xl px-6 py-3"
              disabled={saving || deleting}
            >
              <Text className="text-white text-base font-bold">
                {deleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditNote;

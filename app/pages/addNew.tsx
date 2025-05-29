import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Calendar, Image as IconImage } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db from "../db/db";
import { notes } from "../db/schema";

export default function AddNewScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Pick image and save to local file system
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      // Copy image to app's document directory
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

  // Save note to DB
  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !image) {
      Alert.alert("Missing Fields", "Please fill all fields and add an image.");
      return;
    }
    setSaving(true);
    try {
      await db.insert(notes).values({
        title,
        description,
        imagePath: image,
      });
      setSaving(false);
      router.back();
    } catch (err) {
      setSaving(false);
      Alert.alert("Error", "Failed to save note.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Image Upload Area */}
        <TouchableOpacity
          className="w-full aspect-[16/9] mb-4 px-4 rounded-xl overflow-hidden"
          activeOpacity={0.8}
          onPress={pickImage}
        >
          {image ? (
            <View className="flex-1 w-full h-full">
              <Image
                source={{ uri: image }}
                className="w-full h-full absolute rounded-xl"
                resizeMode="cover"
              />
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
            </View>
          ) : (
            <View className="flex-1 w-full h-full bg-surface-light rounded-xl items-center justify-center border-2 border-dashed border-accent-light">
              <IconImage size={48} color="#a97c5a" weight="regular" />
              <Text className="text-accent-light mt-2 font-medium text-base">
                Click to add a picture
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Title Input */}
        <View className="px-4 pt-2">
          <TextInput
            placeholder="Trip title"
            placeholderTextColor="#a97c5a"
            className="w-full rounded-2xl bg-surface-light text-accent-light text-lg font-medium p-4 mb-4"
            style={{ minHeight: 56 }}
            value={title}
            onChangeText={setTitle}
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
        </View>
        {/* Add to your note */}
        <Text className="px-4 pt-4 pb-2 text-lg font-bold text-primary">
          Add to your note
        </Text>
        <View className="gap-4 px-4">
          {/* Add dates */}
          <TouchableOpacity className="flex-row items-center mb-2">
            <View className="size-12 rounded-xl bg-surface-light items-center justify-center mr-4">
              <Calendar size={28} color="#1b130d" weight="regular" />
            </View>
            <Text className="text-base text-primary">Add dates</Text>
          </TouchableOpacity>
          {/* Add reminder */}
          <TouchableOpacity className="flex-row items-center mb-2">
            <View className="size-12 rounded-xl bg-surface-light items-center justify-center mr-4">
              <Bell size={28} color="#1b130d" weight="regular" />
            </View>
            <Text className="text-base text-primary">Add reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  );
}

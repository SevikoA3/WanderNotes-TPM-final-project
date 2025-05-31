import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Bell, Calendar, Image as IconImage } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import db from "../db/db";
import { notes } from "../db/schema";
import { locationEventEmitter } from "../services/locationEvents";

export default function AddNewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [address, setAddress] = useState<string>("");

  // Ambil lokasi saat ini saat komponen mount
  React.useEffect(() => {
    const getLocation = async () => {
      setLocLoading(true);
      try {
        const { status } = await (await import("expo-location")).requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          setLocLoading(false);
          return;
        }
        const loc = await (await import("expo-location")).getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (err) {
        Alert.alert("Error", "Failed to get location.");
      } finally {
        setLocLoading(false);
      }
    };

    // Only fetch current GPS location if no location was passed via params
    // from the selectLocation screen.
    if (params.selectedLatitude === undefined && params.selectedLongitude === undefined) {
      getLocation();
    }
  }, []);

  // Update location if returned from selectLocation
  React.useEffect(() => {
    const lat = Number(params.selectedLatitude);
    const lng = Number(params.selectedLongitude);
    if (params.selectedLatitude !== undefined && params.selectedLongitude !== undefined && !isNaN(lat) && !isNaN(lng)) {
      setLocation({
        latitude: lat,
        longitude: lng,
      });
    }
  }, [params.selectedLatitude, params.selectedLongitude]);

  // Reverse geocoding setiap kali location berubah
  React.useEffect(() => {
    const getAddress = async () => {
      if (location) {
        try {
          const Location = await import("expo-location");
          const res = await Location.reverseGeocodeAsync(location);
          if (res && res.length > 0) {
            const a = res[0];
            setAddress([a.name, a.street, a.city, a.region, a.country].filter(Boolean).join(", "));
          } else {
            setAddress("");
          }
        } catch (e) {
          setAddress("");
        }
      } else {
        setAddress("");
      }
    };
    getAddress();
  }, [location]);

  // Listen for locationSelected event from locationEventEmitter
  React.useEffect(() => {
    // @ts-ignore: event name is dynamic
    const sub = locationEventEmitter.addListener(
      // @ts-ignore
      "locationSelected",
      (loc: { latitude: number; longitude: number }) => {
        setLocation(loc);
      }
    );
    return () => sub.remove();
  }, []);

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
    if (!title.trim() || !description.trim() || !image || !location || !address) {
      Alert.alert("Missing Fields", "Please fill all fields, add an image, and set location.");
      return;
    }
    setSaving(true);
    try {
      await db.insert(notes).values({
        title,
        description,
        imagePath: image,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
        createdAt: new Date().toISOString(),
      });
      setSaving(false);
      router.back();
    } catch (err) {
      setSaving(false);
      Alert.alert("Error", "Failed to save note.");
      console.error(err);
    }
  };

  // Navigasi ke page selectLocation
  const handlePickLocation = () => {
    router.push({
      pathname: "/pages/modal.selectLocation",
      params: location ? { latitude: location.latitude, longitude: location.longitude } : {},
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={"padding"}>
      <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {/* Image Upload Area */}
            <TouchableOpacity
              className="w-full aspect-[16/9] mb-4 px-4 rounded-xl overflow-hidden"
              activeOpacity={0.8}
              onPress={pickImage}
            >
              {image ? (
                <View className="flex-1 w-full h-full">
                  <Image source={{ uri: image }} className="w-full h-full absolute rounded-xl" resizeMode="cover" />
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
                      <Text className="text-white text-lg font-bold">Press to edit</Text>
                    </View>
                  </LinearGradient>
                </View>
              ) : (
                <View className="flex-1 w-full h-full bg-surface-light rounded-xl items-center justify-center border-2 border-dashed border-accent-light">
                  <IconImage size={48} color="#a97c5a" weight="regular" />
                  <Text className="text-accent-light mt-2 font-medium text-base">Press to add a picture</Text>
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
                maxLength={20}
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
            {/* Lokasi (pindah ke atas Add to your note) */}
            <View className="px-4 pb-2">
              <Text className="text-base text-primary font-bold mb-1">Location</Text>
              <TouchableOpacity
                onPress={handlePickLocation}
                className="rounded-xl bg-surface-light px-4 py-3 flex-row items-center"
                disabled={locLoading}
              >
                <View>
                  <Text className="text-accent-light text-base">
                    {address ? address : locLoading ? "Getting location..." : "Pick location"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* Add to your note */}
            <Text className="px-4 pt-4 pb-2 text-lg font-bold text-primary">Add to your note</Text>
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
        </TouchableWithoutFeedback>
        {/* Save Button */}
        <View className="px-4 pb-6 pt-2 bg-transparent">
          <TouchableOpacity
            className="w-full h-14 rounded-2xl bg-orange-dark items-center justify-center"
            onPress={handleSave}
            disabled={saving}
          >
            <Text className="text-white text-lg font-bold">{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

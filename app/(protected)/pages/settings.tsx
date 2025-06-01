import { Picker } from "@react-native-picker/picker";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Globe,
  Image as ImageIcon,
  Key,
  Trash,
  UserCircle,
} from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import UserAvatar from "../../components/UserAvatar";
import db, { eq } from "../../db/db";
import { users } from "../../db/schema";
import { useAuth } from "../../utils/authContext";
import { getAllTimezones } from "../../utils/location";

type UserData = {
  id: number;
  username: string;
  createdAt: string;
  profileImage: string | null;
};

const FINGERPRINT_ENABLED_KEY = "fingerprint_enabled";

const SettingsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(user);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showChangeProfilePic, setShowChangeProfilePic] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [showChangeTimezone, setShowChangeTimezone] = useState(false);
  const [timezone, setTimezone] = useState<string>(
    user?.timezone || "Asia/Jakarta"
  );
  const [allTimezones] = useState<string[]>(getAllTimezones());
  const [fingerprintEnabled, setFingerprintEnabled] = useState<boolean>(false);
  const [fingerprintSupported, setFingerprintSupported] =
    useState<boolean>(false);
  const [hasSavedUsername, setHasSavedUsername] = useState<boolean>(false);

  // Fetch latest user data from DB
  const fetchUserData = async () => {
    if (!user) return;
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    if (userRow) {
      // Exclude password from userData
      const { password, ...rest } = userRow;
      setUserData(rest);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  React.useEffect(() => {
    (async () => {
      const enabled = await SecureStore.getItemAsync(FINGERPRINT_ENABLED_KEY);
      setFingerprintEnabled(enabled === "true");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setFingerprintSupported(hasHardware);
      const savedUsername = await SecureStore.getItemAsync("saved_username");
      setHasSavedUsername(!!savedUsername);
    })();
  }, []);

  const handleToggleFingerprint = async (value: boolean) => {
    if (value) {
      // Cek hardware & enrollment
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert("Error", "Fingerprint not available or not enrolled.");
        return;
      }
      await SecureStore.setItemAsync(FINGERPRINT_ENABLED_KEY, "true");
      setFingerprintEnabled(true);
      Alert.alert("Success", "Fingerprint login enabled!");
    } else {
      await SecureStore.setItemAsync(FINGERPRINT_ENABLED_KEY, "false");
      setFingerprintEnabled(false);
      Alert.alert("Info", "Fingerprint login disabled.");
    }
  };

  async function handleChangePassword({
    user,
    oldPassword,
    newPassword,
    confirmPassword,
    setShowChangePassword,
    setOldPassword,
    setNewPassword,
    setConfirmPassword,
    setLoading,
  }: any) {
    if (!user) return;
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const hashOld = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        oldPassword
      );
      const userRow = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .get();
      if (!userRow || userRow.password !== hashOld) {
        Alert.alert("Error", "Old password is incorrect.");
        setLoading(false);
        return;
      }
      const hashNew = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword
      );
      await db
        .update(users)
        .set({ password: hashNew })
        .where(eq(users.id, user.id))
        .run();
      Alert.alert("Success", "Password changed successfully!");
      setShowChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fetchUserData(); // Refresh user data
    } catch (err) {
      Alert.alert("Error", "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeUsername({
    user,
    newUsername,
    setShowChangeUsername,
    setNewUsername,
    setLoading,
  }: any) {
    if (!user) return;
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      Alert.alert("Error", "Username cannot be empty.");
      return;
    }
    if (/\s/.test(trimmedUsername)) {
      Alert.alert("Error", "Username cannot contain spaces.");
      return;
    }
    if (trimmedUsername.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    try {
      // Check if username exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, trimmedUsername))
        .get();
      if (existing && existing.id !== user.id) {
        Alert.alert("Error", "Username already exists.");
        setLoading(false);
        return;
      }
      await db
        .update(users)
        .set({ username: trimmedUsername })
        .where(eq(users.id, user.id))
        .run();
      Alert.alert("Success", "Username changed successfully!");
      setShowChangeUsername(false);
      setNewUsername("");
      fetchUserData(); // Refresh user data
    } catch (err) {
      Alert.alert("Error", "Failed to change username.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeProfilePic({
    user,
    newProfilePic,
    setShowChangeProfilePic,
    setNewProfilePic,
    setLoading,
  }: any) {
    if (!user) return;
    if (!newProfilePic) {
      Alert.alert("Error", "No image selected.");
      return;
    }
    setLoading(true);
    try {
      await db
        .update(users)
        .set({ profileImage: newProfilePic })
        .where(eq(users.id, user.id))
        .run();
      Alert.alert("Success", "Profile picture updated!");
      setShowChangeProfilePic(false);
      setNewProfilePic(null);
      fetchUserData(); // Refresh user data
    } catch (err) {
      Alert.alert("Error", "Failed to update profile picture.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeTimezone() {
    if (!user) return;
    setLoading(true);
    try {
      await db
        .update(users)
        .set({ timezone: timezone })
        .where(eq(users.id, user.id))
        .run();
      Alert.alert("Success", "Timezone updated!");
      setShowChangeTimezone(false);
      fetchUserData();
    } catch (err) {
      Alert.alert("Error", "Failed to update timezone.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount({ user, setLoading, router }: any) {
    if (!user) return;
    setLoading(true);
    try {
      await db.delete(users).where(eq(users.id, user.id)).run();
      router.replace("/login");
    } catch (err) {
      Alert.alert("Error", "Failed to delete account.");
    } finally {
      setLoading(false);
    }
  }

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewProfilePic(result.assets[0].uri);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Account Section */}
        <Text className="text-primary text-2xl font-bold px-6 pt-6 pb-2">
          Account
        </Text>
        <View className="flex-row items-center gap-4 bg-background px-6 py-4 rounded-2xl shadow-sm mb-4">
          <UserAvatar
            uri={newProfilePic || userData?.profileImage || ""}
            size={64}
          />
          <View className="flex-col justify-center flex-1">
            <Text className="text-primary text-lg font-bold line-clamp-1 mb-1">
              {userData?.username}
            </Text>
            <Text className="text-accent text-sm font-normal leading-normal line-clamp-2">
              Created At:{" "}
              {new Date(userData?.createdAt || "").toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Profile Actions Section */}
        <View className="bg-white/80 rounded-2xl shadow-md mx-4 mb-6 divide-y divide-accent/20">
          {/* Change Username */}
          <TouchableOpacity onPress={() => setShowChangeUsername((v) => !v)}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <UserCircle size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Change Username
              </Text>
            </View>
          </TouchableOpacity>
          {showChangeUsername && (
            <View className="px-8 pb-4">
              <TextInput
                className="bg-surface rounded-xl p-3 mb-2 w-full text-base text-primary border-none"
                placeholder="New Username"
                value={newUsername}
                onChangeText={setNewUsername}
                placeholderTextColor={"#6b4f3b"}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="bg-orange-light py-3 rounded-full w-full mb-2 shadow-md"
                disabled={loading}
                onPress={() =>
                  handleChangeUsername({
                    user,
                    newUsername,
                    setShowChangeUsername,
                    setNewUsername,
                    setLoading,
                  })
                }
              >
                <Text className="text-primary text-center font-bold text-base">
                  {loading ? "Saving..." : "Save Username"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Change Profile Picture */}
          <TouchableOpacity onPress={() => setShowChangeProfilePic((v) => !v)}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <ImageIcon size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Change Profile Picture
              </Text>
            </View>
          </TouchableOpacity>
          {showChangeProfilePic && (
            <View className="px-8 pb-4 items-center">
              {newProfilePic ? (
                <Image
                  source={{ uri: newProfilePic }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    marginBottom: 16,
                  }}
                />
              ) : null}
              <TouchableOpacity
                className="bg-surface py-2 px-4 rounded-full mb-2"
                onPress={pickImage}
                disabled={loading}
              >
                <Text className="text-primary text-center font-bold text-base">
                  Pick Image
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-orange-light py-3 rounded-full w-full mb-2 shadow-md"
                disabled={loading || !newProfilePic}
                onPress={() =>
                  handleChangeProfilePic({
                    user,
                    newProfilePic,
                    setShowChangeProfilePic,
                    setNewProfilePic,
                    setLoading,
                  })
                }
              >
                <Text className="text-primary text-center font-bold text-base">
                  {loading ? "Saving..." : "Save Profile Picture"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Change Password */}
          <TouchableOpacity onPress={() => setShowChangePassword((v) => !v)}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Key size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Change Password
              </Text>
            </View>
          </TouchableOpacity>
          {showChangePassword && (
            <View className="px-8 pb-4">
              <TextInput
                className="bg-surface rounded-xl p-3 mb-2 w-full text-base text-primary border-none"
                placeholder="Old Password"
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholderTextColor={"#6b4f3b"}
                secureTextEntry
              />
              <TextInput
                className="bg-surface rounded-xl p-3 mb-2 w-full text-base text-primary border-none"
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholderTextColor={"#6b4f3b"}
                secureTextEntry
              />
              <TextInput
                className="bg-surface rounded-xl p-3 mb-2 w-full text-base text-primary border-none"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor={"#6b4f3b"}
                secureTextEntry
              />
              <TouchableOpacity
                className="bg-orange-light py-3 rounded-full w-full mb-2 shadow-md"
                disabled={loading}
                onPress={() =>
                  handleChangePassword({
                    user,
                    oldPassword,
                    newPassword,
                    confirmPassword,
                    setShowChangePassword,
                    setOldPassword,
                    setNewPassword,
                    setConfirmPassword,
                    setLoading,
                  })
                }
              >
                <Text className="text-primary text-center font-bold text-base">
                  {loading ? "Saving..." : "Save Password"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Change Timezone */}
          <TouchableOpacity onPress={() => setShowChangeTimezone((v) => !v)}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Globe size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Change Timezone
              </Text>
            </View>
          </TouchableOpacity>
          {showChangeTimezone && (
            <View className="px-8 pb-4">
              <Text className="text-primary mb-2">Timezone</Text>
              <View className="bg-surface rounded-lg border border-accent">
                <Picker
                  selectedValue={timezone}
                  onValueChange={setTimezone}
                  style={{ width: "100%", color: "#1b130d" }}
                >
                  {allTimezones.map((tz) => (
                    <Picker.Item key={tz} label={tz} value={tz} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                className="bg-orange-light py-3 rounded-full w-full mb-2 shadow-md mt-4"
                disabled={loading}
                onPress={handleChangeTimezone}
              >
                <Text className="text-primary text-center font-bold text-base">
                  {loading ? "Saving..." : "Save Timezone"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Fingerprint Section */}
        <Text className="text-primary text-xl font-bold px-6 pt-2 pb-1">
          Security
        </Text>
        <View className="bg-white/80 rounded-2xl shadow-md mx-4 mb-6 divide-y divide-accent/20">
          {fingerprintSupported && hasSavedUsername ? (
            <View className="flex-row items-center gap-4 px-4 py-4">
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Enable Fingerprint Login
              </Text>
              <TouchableOpacity
                onPress={() => handleToggleFingerprint(!fingerprintEnabled)}
                style={{ padding: 8 }}
              >
                <Text
                  style={{
                    color: fingerprintEnabled ? "#4caf50" : "#aaa",
                    fontWeight: "bold",
                  }}
                >
                  {fingerprintEnabled ? "ON" : "OFF"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center gap-4 px-4 py-4">
              <Text className="text-accent text-base font-normal flex-1 truncate">
                {fingerprintSupported
                  ? "Login manually first to enable fingerprint."
                  : "Fingerprint is not available on this device."}
              </Text>
            </View>
          )}
        </View>

        {/* Danger Section */}
        <Text className="text-primary text-xl font-bold px-6 pt-2 pb-1">
          Danger Zone
        </Text>
        <View className="bg-white/80 rounded-2xl shadow-md mx-4 mb-10">
          <TouchableOpacity
            onPress={() => {
              if (!user) return;
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone!",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                      handleDeleteAccount({ user, setLoading, router }),
                  },
                ]
              );
            }}
          >
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Trash size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Delete Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

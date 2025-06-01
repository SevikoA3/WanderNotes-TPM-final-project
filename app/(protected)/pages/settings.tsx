import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { Bell, Envelope, Fingerprint, Key, Trash } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import UserAvatar from "../../components/UserAvatar";
import db, { eq } from "../../db/db";
import { users } from "../../db/schema";
import { useAuth } from "../../utils/auth-context";

const SettingsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [isFingerprintLoginEnabled, setIsFingerprintLoginEnabled] =
    useState(false);
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] =
    useState(false);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] =
    useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleFingerprint = () =>
    setIsFingerprintLoginEnabled((previousState) => !previousState);
  const togglePushNotifications = () =>
    setIsPushNotificationsEnabled((previousState) => !previousState);
  const toggleEmailNotifications = () =>
    setIsEmailNotificationsEnabled((previousState) => !previousState);

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
    } catch (err) {
      Alert.alert("Error", "Failed to change password.");
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Account Section */}
        <Text className="text-primary text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Account
        </Text>
        <View className="flex-row items-center gap-4 bg-background px-4 min-h-[72px] py-2">
          <UserAvatar
            uri={
              user?.profileImage ||
              "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
            }
            size={56}
          />
          <View className="flex-col justify-center">
            <Text className="text-primary text-base font-medium leading-normal line-clamp-1">
              {user?.username}
            </Text>
            <Text className="text-accent text-sm font-normal leading-normal line-clamp-2">
              Created At:{" "}
              {new Date(user?.createdAt || "").toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowChangePassword((v) => !v)}>
          <View className="flex-row items-center gap-4 bg-background px-4 min-h-14">
            <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
              <Key size={24} color="#1b130d" />
            </View>
            <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
              Change Password
            </Text>
          </View>
        </TouchableOpacity>
        {showChangePassword && (
          <View className="px-4 pb-4">
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
          <View className="flex-row items-center gap-4 bg-background px-4 min-h-14">
            <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
              <Trash size={24} color="#1b130d" />
            </View>
            <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
              Delete Account
            </Text>
          </View>
        </TouchableOpacity>

        {/* Security Section */}
        <Text className="text-primary text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Security
        </Text>
        <View className="flex-row items-center gap-4 bg-background px-4 min-h-14 justify-between">
          <View className="flex-row items-center gap-4">
            <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
              <Fingerprint size={24} color="#1b130d" />
            </View>
            <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
              Fingerprint Login
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#f3ece7", true: "#ed782a" }}
            thumbColor={isFingerprintLoginEnabled ? "#fcfaf8" : "#fcfaf8"}
            ios_backgroundColor="#f3ece7"
            onValueChange={toggleFingerprint}
            value={isFingerprintLoginEnabled}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

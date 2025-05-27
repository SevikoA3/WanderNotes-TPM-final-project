import { useRouter } from "expo-router";
import { Bell, Envelope, Fingerprint, Key, Trash } from "phosphor-react-native";
import React, { useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  const router = useRouter();

  const [isFingerprintLoginEnabled, setIsFingerprintLoginEnabled] =
    useState(false);
  const [isPushNotificationsEnabled, setIsPushNotificationsEnabled] =
    useState(false);
  const [isEmailNotificationsEnabled, setIsEmailNotificationsEnabled] =
    useState(false);

  const toggleFingerprint = () =>
    setIsFingerprintLoginEnabled((previousState) => !previousState);
  const togglePushNotifications = () =>
    setIsPushNotificationsEnabled((previousState) => !previousState);
  const toggleEmailNotifications = () =>
    setIsEmailNotificationsEnabled((previousState) => !previousState);

  return (
    <SafeAreaView className="flex-1 bg-[#fcfaf8]">
      <ScrollView className="flex-1">
        {/* Account Section */}
        <Text className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Account
        </Text>
        <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-[72px] py-2">
          <ImageBackground
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBRgTlkCLqmSZiXu3UnGuR7c2sFGrebgGHhL3m85BGQhbxEN6JPxqm9xTJ6DPZFSVbqhUqbnvEQxG8xHAgKtYaFhXh6b7mEsYL_pQR-7spnev0d1Jmqa7WvPPzg__33h0Rtg2wpKxjpauFOE1K1ksbOmD6GiTvBIh2sYMWUXeVMG_fuG6MIADHJfvfiePbYLsRpyxwmZwKkRtgBJu8w7wJyaHDo32DHXUs_a5_0awR4zO2mwmuDM00VrgZbU8Kuxo4HDbKQT-hODUx",
            }}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
            imageStyle={{ borderRadius: 9999 }}
          />
          <View className="flex-col justify-center">
            <Text className="text-[#1b130d] text-base font-medium leading-normal line-clamp-1">
              Jennifer Lee
            </Text>
            <Text className="text-[#9a6b4c] text-sm font-normal leading-normal line-clamp-2">
              jennifer.lee@email.com
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => console.log("Change Password")}>
          <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-14">
            <View className="text-[#1b130d] flex items-center justify-center rounded-lg bg-[#f3ece7] shrink-0 size-10">
              <Key size={24} color="#1b130d" />
            </View>
            <Text className="text-[#1b130d] text-base font-normal leading-normal flex-1 truncate">
              Change Password
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log("Delete Account")}>
          <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-14">
            <View className="text-[#1b130d] flex items-center justify-center rounded-lg bg-[#f3ece7] shrink-0 size-10">
              <Trash size={24} color="#1b130d" />
            </View>
            <Text className="text-[#1b130d] text-base font-normal leading-normal flex-1 truncate">
              Delete Account
            </Text>
          </View>
        </TouchableOpacity>

        {/* Security Section */}
        <Text className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Security
        </Text>
        <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-14 justify-between">
          <View className="flex-row items-center gap-4">
            <View className="text-[#1b130d] flex items-center justify-center rounded-lg bg-[#f3ece7] shrink-0 size-10">
              <Fingerprint size={24} color="#1b130d" />
            </View>
            <Text className="text-[#1b130d] text-base font-normal leading-normal flex-1 truncate">
              Fingerprint Login
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#f3ece7", true: "#ed782a" }}
            thumbColor={isFingerprintLoginEnabled ? "#fcfaf8" : "#fcfaf8"} // Thumb color can be same or different
            ios_backgroundColor="#f3ece7"
            onValueChange={toggleFingerprint}
            value={isFingerprintLoginEnabled}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Adjusted scale for closer size match
          />
        </View>

        {/* Notifications Section */}
        <Text className="text-[#1b130d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Notifications
        </Text>
        <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-14 justify-between">
          <View className="flex-row items-center gap-4">
            <View className="text-[#1b130d] flex items-center justify-center rounded-lg bg-[#f3ece7] shrink-0 size-10">
              <Bell size={24} color="#1b130d" />
            </View>
            <Text className="text-[#1b130d] text-base font-normal leading-normal flex-1 truncate">
              Push Notifications
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#f3ece7", true: "#ed782a" }}
            thumbColor="#fcfaf8"
            ios_backgroundColor="#f3ece7"
            onValueChange={togglePushNotifications}
            value={isPushNotificationsEnabled}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>

        <View className="flex-row items-center gap-4 bg-[#fcfaf8] px-4 min-h-14 justify-between">
          <View className="flex-row items-center gap-4">
            <View className="text-[#1b130d] flex items-center justify-center rounded-lg bg-[#f3ece7] shrink-0 size-10">
              <Envelope size={24} color="#1b130d" />
            </View>
            <Text className="text-[#1b130d] text-base font-normal leading-normal flex-1 truncate">
              Email Notifications
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#f3ece7", true: "#ed782a" }}
            thumbColor="#fcfaf8"
            ios_backgroundColor="#f3ece7"
            onValueChange={toggleEmailNotifications}
            value={isEmailNotificationsEnabled}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
        <View className="h-5 bg-[#fcfaf8]" />
        {/* Bottom Spacer */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

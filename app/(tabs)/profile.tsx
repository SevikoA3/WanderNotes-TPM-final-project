import { useRouter } from "expo-router";
import { ArrowLeft, Gear, Megaphone, X } from "phosphor-react-native"; // Renamed User to UserIcon to avoid conflict
import React from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Notes for usage:
// 1. Icons: Uses phosphor-react-native. Ensure it's installed.
// 2. Navigation: Uses useRouter from expo-router for navigation.
// 3. NativeWind: Assumes NativeWind v4+ for direct className.

const ProfileScreen = () => {
  const router = useRouter();

  const handleNavigateToSettings = () => {
    router.push("/components/settings"); // Navigate to settings screen
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logout pressed");
    // Example: router.replace('/login');
  };

  const handleFeedback = () => {
    // Implement feedback logic here
    console.log("Feedback pressed");
  };

  // Placeholder for back navigation if this screen were part of a stack directly
  // For a tab, the X might close a modal or navigate to a different part of the app.
  // Here, it's more of a placeholder from the design.
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/home"); // Fallback to home if no back history
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 justify-between">
        {/* Main Content ScrollView */}
        <ScrollView>
          {/* Header */}
          <View className="flex-row items-center bg-background p-4 pb-2 justify-between">
            <TouchableOpacity
              onPress={handleClose}
              className="flex size-12 shrink-0 items-center justify-center text-[#1b130d]"
            >
              <X size={24} color="#1b130d" />
            </TouchableOpacity>
            <Text className="text-primary text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
              Profile
            </Text>
          </View>

          {/* Profile Info */}
          <View className="flex p-4 items-center">
            <View className="flex w-full flex-col gap-4 items-center">
              <View className="flex gap-4 flex-col items-center">
                <ImageBackground
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFFvJbcDJruUzaNmgOfeyWGItfMwMh9jgAYWFmyibDAyK5W5pwFtQLbsK1yLisSmBDSW9ISLF7zcJq-Ym2-PKGFIq0wv_JmugruOLbHRYw-doP54VEu_YptzNSrCPS8LKiH_Sq0OMNVKdeCk_XJYmwUxMs18Z4SiERBvjgE4qD8-2v2V4PjotPyzvl0U8G96dzyMtAPr_oqUp58ICJWYvvC1E5-gq55uXAkesu29bebNe3ua5VBaZAbfco394t9057CqE1Jkyh4g0I",
                  }}
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                  imageStyle={{ borderRadius: 9999 }}
                />
                <View className="flex flex-col items-center justify-center">
                  <Text className="text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                    Sophia Carter
                  </Text>
                  <Text className="text-accent text-base font-normal leading-normal text-center">
                    Travel Enthusiast
                  </Text>
                  <Text className="text-accent text-base font-normal leading-normal text-center">
                    Joined 2021
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action List */}
          <TouchableOpacity onPress={handleNavigateToSettings}>
            <View className="flex-row items-center gap-4 bg-background px-4 min-h-14">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Gear size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
                Settings
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFeedback}>
            <View className="flex-row items-center gap-4 bg-background px-4 min-h-14">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Megaphone size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
                Feedback
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <View className="flex-row items-center gap-4 bg-background px-4 min-h-14">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                {/* Using SignOut icon might be more conventional for logout */}
                <ArrowLeft size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal leading-normal flex-1 truncate">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Spacer for bottom safe area, if not using a tab bar that handles it */}
        {/* <View className="h-5 bg-background" /> */}
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

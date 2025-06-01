import { useRouter } from "expo-router";
import { ArrowLeft, Gear, Megaphone, X } from "phosphor-react-native"; // Renamed User to UserIcon to avoid conflict
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../utils/authContext";

// Notes for usage:
// 1. Icons: Uses phosphor-react-native. Ensure it's installed.
// 2. Navigation: Uses useRouter from expo-router for navigation.
// 3. NativeWind: Assumes NativeWind v4+ for direct className.

const ProfileScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleNavigateToSettings = () => {
    router.push("/pages/settings"); // Navigate to settings screen
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
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
              className="flex size-12 shrink-0 items-center justify-center text-primary"
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
                <UserAvatar
                  uri={
                    user?.profileImage ||
                    "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg"
                  }
                  size={128}
                />
                <View className="flex flex-col items-center justify-center">
                  <Text className="text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] text-center">
                    {user?.username}
                  </Text>
                  <Text className="text-accent text-base font-normal leading-normal text-center">
                    Created At:{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
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

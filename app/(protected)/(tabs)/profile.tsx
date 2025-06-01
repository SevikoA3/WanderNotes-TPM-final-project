import { useFocusEffect, useRouter } from "expo-router";
import { ArrowLeft, Gear, Megaphone } from "phosphor-react-native"; // Renamed User to UserIcon to avoid conflict
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "../../components/UserAvatar";
import db, { eq } from "../../db/db";
import { users } from "../../db/schema";
import { useAuth } from "../../utils/authContext";

// Notes for usage:
// 1. Icons: Uses phosphor-react-native. Ensure it's installed.
// 2. Navigation: Uses useRouter from expo-router for navigation.
// 3. NativeWind: Assumes NativeWind v4+ for direct className.

type UserData = {
  id: number;
  username: string;
  createdAt: string;
  profileImage: string | null;
};

const ProfileScreen = () => {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [userData, setUserData] = React.useState<UserData | null>(user);

  // Fetch latest user data from DB
  const fetchUserData = async () => {
    if (!user) return;
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();
    if (userRow) {
      const { password, ...rest } = userRow;
      setUserData(rest);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleNavigateToSettings = () => {
    router.push("/pages/settings"); // Navigate to settings screen
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const handleKesanPesan = () => {
    router.push("/pages/kesanPesan");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <Text className="text-primary text-2xl font-bold px-6 pt-6 pb-2 text-center">
          Profile
        </Text>

        {/* Profile Info */}
        <View className="flex p-6 items-center bg-white/80 rounded-2xl shadow-md mx-4 mb-6">
          <UserAvatar uri={userData?.profileImage || ""} size={96} />
          <View className="flex flex-col items-center justify-center mt-4">
            <Text className="text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] text-center mb-1">
              {userData?.username}
            </Text>
            <Text className="text-accent text-base font-normal leading-normal text-center">
              Created At:{" "}
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : ""}
            </Text>
          </View>
        </View>

        {/* Action List */}
        <Text className="text-primary text-xl font-bold px-6 pt-2 pb-1">
          Actions
        </Text>
        <View className="bg-white/80 rounded-2xl shadow-md mx-4 mb-10 divide-y divide-accent/20">
          <TouchableOpacity onPress={handleNavigateToSettings}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Gear size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Settings
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleKesanPesan}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                <Megaphone size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Impressions & Messages
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout}>
            <View className="flex-row items-center gap-4 px-4 py-4">
              <View className="text-primary flex items-center justify-center rounded-lg bg-surface shrink-0 size-10">
                {/* Using SignOut icon might be more conventional for logout */}
                <ArrowLeft size={24} color="#1b130d" />
              </View>
              <Text className="text-primary text-base font-normal flex-1 truncate">
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

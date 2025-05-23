import { Tabs, useRouter } from "expo-router";
import { House, Plus, User as UserIcon } from "phosphor-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

// Custom TabBarIcon component
const TabBarIcon = ({
  icon,
  color,
  focused,
}: {
  icon: React.ElementType;
  color: string;
  focused: boolean;
}) => {
  const IconComponent = icon;
  return (
    <View className="items-center justify-center">
      <IconComponent
        size={24}
        color={color}
        weight={focused ? "fill" : "regular"}
      />
    </View>
  );
};

const CustomTabBarButton = ({ onPress }: { onPress: () => void }) => (
  <View className="w-full items-center absolute top-[-30px] left-0 z-10">
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center w-16 h-16 rounded-full bg-[#FF6347] shadow-lg"
      style={{ elevation: 8 }}
    >
      <Plus size={32} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide header for all tabs
        tabBarActiveTintColor: "#1b130d", // Color for active tab icon and label
        tabBarInactiveTintColor: "#9a6b4c", // Color for inactive tab icon and label
        tabBarStyle: {
          backgroundColor: "#fcfaf8", // Background color of the tab bar
          borderTopColor: "#f3ece7", // Top border color of the tab bar
          height: 70, // Increased height to accommodate the custom button
          paddingBottom: 10, // Add padding for labels
        },
        tabBarShowLabel: true, // Use default label only
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={House} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="addNew"
        options={{
          title: "New", // Or an empty string if you don't want a label
          tabBarIcon: () => <View />, // Placeholder, actual button is custom
          tabBarButton: () => (
            <CustomTabBarButton onPress={() => router.push("/(tabs)/addNew")} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={UserIcon} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

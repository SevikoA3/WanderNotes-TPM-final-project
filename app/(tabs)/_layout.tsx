import { Tabs } from "expo-router";
import { House, Money, User as UserIcon } from "phosphor-react-native";
import React from "react";
import { View } from "react-native";

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

export default function TabLayout() {
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
        name="currency-exchange"
        options={{
          title: "Currency",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Money} color={color} focused={focused} />
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

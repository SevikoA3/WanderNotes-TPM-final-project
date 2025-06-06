import { Tabs } from "expo-router";
import {
  House,
  Money,
  Person,
  OpenAiLogo,
  User as UserIcon,
} from "phosphor-react-native";
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
        tabBarActiveTintColor: "#1b130d", // Use Tailwind config color
        tabBarInactiveTintColor: "#9a6b4c", // Use Tailwind config color
        tabBarStyle: {
          backgroundColor: "#fcfaf8", // Use Tailwind config color
          borderTopColor: "#f3ece7", // Use Tailwind config color
          height: 70, // Increased height to accommodate the custom button
          paddingBottom: 10, // Add padding for labels
        },
        tabBarShowLabel: true, // Use default label only
        // Add consistent label style for all tabs
        tabBarLabelStyle: {
          color: "#1b130d",
          fontSize: 14,
          fontWeight: "bold",
        },
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
        name="pedometer"
        options={{
          title: "Steps",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Person} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          headerShown: true,
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={OpenAiLogo} color={color} focused={focused} />
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

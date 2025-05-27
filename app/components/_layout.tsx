import { Stack } from "expo-router";

export default function componentsLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
          contentStyle: {
            backgroundColor: "#fdf9f6", // Set background color for the stack
          },
        }}
      >
        <Stack.Screen
          name="addNew"
          options={{
            title: "New Adventure", // Title for the addNew screen
            headerShown: true, // Show header for this screen
            headerStyle: {
              backgroundColor: "#fdf9f6", // Header background color
            },
            headerTitleStyle: {
              color: "#191410", // Header title color
              fontSize: 24, // Header title font size
              fontWeight: "bold", // Header title font weight
            },
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "Settings", // Title for the settings screen
            headerShown: true, // Show header for this screen
            headerStyle: {
              backgroundColor: "#fdf9f6", // Header background color
            },
            headerTitleStyle: {
              color: "#191410", // Header title color
              fontSize: 24, // Header title font size
              fontWeight: "bold", // Header title font weight
            },
          }}
        />
      </Stack>
    </>
  );
}

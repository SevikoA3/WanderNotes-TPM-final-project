import { Stack } from "expo-router";

export default function componentsLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
          contentStyle: {
            backgroundColor: "#fcfaf8", // Use Tailwind config color
          },
        }}
      >
        <Stack.Screen
          name="addNote"
          options={{
            title: "New Adventure", // Title for the addNote screen
            headerShown: true, // Show header for this screen
            headerStyle: {
              backgroundColor: "#fcfaf8", // Use Tailwind config color
            },
            headerTitleStyle: {
              color: "#1b130d", // Use Tailwind config color
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
              backgroundColor: "#fcfaf8", // Use Tailwind config color
            },
            headerTitleStyle: {
              color: "#1b130d", // Use Tailwind config color
              fontSize: 24, // Header title font size
              fontWeight: "bold", // Header title font weight
            },
          }}
        />

        <Stack.Screen
          name="modal.selectLocation"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            headerShown: false,
            title: "Pick Location",
          }}
        />

        <Stack.Screen
          name="viewNote"
          options={{
            title: "",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fcfaf8", // Use Tailwind config color
            },
            headerTitleStyle: {
              color: "#1b130d", // Use Tailwind config color
              fontSize: 24, // Header title font size
              fontWeight: "bold", // Header title font weight
            },
          }}
        />

        <Stack.Screen
          name="kesanPesan"
          options={{
            title: "Impression & Messages",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fcfaf8",
            },
            headerTitleStyle: {
              color: "#1b130d",
              fontSize: 24,
              fontWeight: "bold",
            },
          }}
        />

        <Stack.Screen
          name="editNote"
          options={{
            title: "Edit Note",
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fcfaf8",
            },
            headerTitleStyle: {
              color: "#1b130d",
              fontSize: 24,
              fontWeight: "bold",
            },
          }}
        />
      </Stack>
    </>
  );
}

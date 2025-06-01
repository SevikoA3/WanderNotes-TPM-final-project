import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { useAuth } from "../utils/authContext";

// Set notification handler (agar notifikasi muncul di foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // untuk iOS 17+
    shouldShowList: true, // untuk iOS 17+
  }),
});

// Set notification channel untuk Android
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  });
}

export default function ProtectedLayout() {
  const { user } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const noteId = response.notification.request.content.data?.noteId;
        if (noteId) {
          router.push(`/pages/viewNote?id=${noteId}`);
        }
      }
    );
    return () => sub.remove();
  }, [router]);

  if (!user) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="pages" options={{ headerShown: false }} />
    </Stack>
  );
}

import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "./global.css";

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

export default function RootLayout() {
  const router = useRouter();
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

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pages" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

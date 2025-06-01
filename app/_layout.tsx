import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import "./global.css";
import { AuthProvider, useAuth } from "./utils/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { user } = useAuth();
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  // Hide header for login/register
  const isAuthPage = currentRoute === "login" || currentRoute === "register";
  if (!user && !isAuthPage) {
    return <Redirect href="/login" />;
  }
  return (
    <Stack>
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}

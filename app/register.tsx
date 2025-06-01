import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import db, { eq } from "./db/db";
import { users } from "./db/schema";
import { useAuth } from "./utils/authContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedPassword2 = password2.trim();

    if (!trimmedUsername || !trimmedPassword || !trimmedPassword2) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (/\s/.test(trimmedUsername)) {
      Alert.alert("Error", "Username cannot contain spaces.");
      return;
    }
    if (/\s/.test(trimmedPassword)) {
      Alert.alert("Error", "Password cannot contain spaces.");
      return;
    }
    if (trimmedUsername.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters.");
      return;
    }
    if (trimmedPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    if (trimmedPassword !== trimmedPassword2) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      // Hash password
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        trimmedPassword
      );
      // Check if username exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, trimmedUsername))
        .get();
      if (existing) {
        Alert.alert("Error", "Username already exists.");
        setLoading(false);
        return;
      }
      // Insert user
      await db.insert(users).values({
        username: trimmedUsername,
        password: hash,
        createdAt: new Date().toISOString(),
      });
      // Simpan session pakai context
      await login(trimmedUsername, trimmedPassword);
      Alert.alert("Success", "Registration successful!", [
        {
          text: "OK",
          // Redirect to home after successful registration and login
          onPress: () =>
            router.replace({ pathname: "/(protected)/(tabs)/home" }),
        },
      ]);
      setUsername("");
      setPassword("");
      setPassword2("");
    } catch (err) {
      Alert.alert("Error", "Failed to register user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="w-full h-64">
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuADiG6jr8EQlhzn_oDCw4Xhbr_zYm_7ZJPDQ6lE7E3bv2pnBxOQ7_tgs2N0rDlfVYieM7g328L861sQmfpLsAT6YUEgeo3dMtyCCqv8wLvrM8ehcMsCuwES0vM82K1d1o5itVyFJ5dzXsPIMqT0wlSeqJbvyFnKdsNKjdw5REIyUVDksfkSjlEPZLJ4S8YrKsHiixFGsPdE_9xxgLRlKDVqWRqdvgTLhvu3VxJPvvwhIX0yluduVTiwEbKAQDrN_HZPKD7lsxF-KqcC",
          }}
          className="w-full h-full object-cover"
        />
      </View>
      <View className="flex-1 justify-start items-center bg-background">
        <View className="w-11/12 max-w-md mx-auto mt-[-32] bg-white/90 rounded-2xl p-6 shadow-2xl items-center">
          <TextInput
            className="bg-surface rounded-xl p-4 mb-4 w-full text-base text-primary border-none"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#a97c5a"
          />
          <TextInput
            className="bg-surface rounded-xl p-4 mb-4 w-full text-base text-primary border-none"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a97c5a"
          />
          <TextInput
            className="bg-surface rounded-xl p-4 mb-6 w-full text-base text-primary border-none"
            placeholder="Repeat Password"
            value={password2}
            onChangeText={setPassword2}
            secureTextEntry
            placeholderTextColor="#a97c5a"
          />
          <TouchableOpacity
            className="bg-orange-light py-4 rounded-full w-full mb-2 shadow-md"
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text className="text-primary text-center font-bold text-xl">
              {loading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="mt-4 mb-12 items-center"
          onPress={() => router.replace("/login")}
          activeOpacity={0.8}
        >
          <Text className="text-primary text-base font-bold underline">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

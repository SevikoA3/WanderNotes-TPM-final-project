import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Eye, EyeSlash, Fingerprint } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./utils/authContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [hasSavedUsername, setHasSavedUsername] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  React.useEffect(() => {
    (async () => {
      const enabled = await SecureStore.getItemAsync("fingerprint_enabled");
      setFingerprintEnabled(enabled === "true");
      const savedUsername = await SecureStore.getItemAsync("saved_username");
      if (savedUsername) {
        setUsername(savedUsername);
        setHasSavedUsername(true);
      }
    })();
  }, []);

  // Fungsi untuk handle login fingerprint
  const handleLoginWithFingerprint = async () => {
    setLoading(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert("Error", "Fingerprint not available or not enrolled.");
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login dengan sidik jari",
        cancelLabel: "Batal",
        disableDeviceFallback: true,
      });
      if (result.success) {
        const success = await login(username, "");
        if (success) {
          router.replace({ pathname: "/home" });
          return;
        } else {
          Alert.alert(
            "Error",
            "Fingerprint login failed. Please login manually."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Alert.alert("Error", "Username and password are required.");
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
    setLoading(true);
    try {
      // Only use context login, which handles hashing and DB check
      const success = await login(trimmedUsername, trimmedPassword);
      if (!success) {
        Alert.alert("Error", "Invalid username or password.");
        setLoading(false);
        return;
      }
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => router.replace({ pathname: "/home" }),
        },
      ]);
      setUsername("");
      setPassword("");
    } catch (err) {
      Alert.alert("Error", "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Top Image */}
      <View className="w-full h-64">
        <Image
          source={require("../assets/images/backgroundImageSea.png")}
          className="w-full h-full object-cover"
        />
      </View>
      {/* Login Form */}
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
          <View className="w-full mb-6 relative">
            <TextInput
              className="bg-surface rounded-xl p-4 w-full text-base text-primary border-none pr-12"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#a97c5a"
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <Eye size={24} color="#a97c5a" />
              ) : (
                <EyeSlash size={24} color="#a97c5a" />
              )}
            </TouchableOpacity>
          </View>
          <View className="w-full flex-row items-center justify-between mb-2">
            <TouchableOpacity
              className="bg-orange-light py-4 rounded-full flex-1 shadow-md mr-2"
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text className="text-primary text-center font-bold text-xl">
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
            {/* Tombol fingerprint login */}
            {fingerprintEnabled && hasSavedUsername && (
              <TouchableOpacity
                className="bg-surface py-4 px-4 rounded-full items-center justify-center ml-2 shadow-md"
                onPress={handleLoginWithFingerprint}
                activeOpacity={0.8}
              >
                <Fingerprint size={28} color="#a97c5a" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          className="mt-4 mb-12 items-center"
          onPress={() => router.push("/register")}
          activeOpacity={0.8}
        >
          <Text className="text-primary text-base font-bold underline">
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

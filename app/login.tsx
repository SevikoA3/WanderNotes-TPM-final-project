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
import { useAuth } from "./utils/auth-context";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      // Only use context login, which handles hashing and DB check
      const success = await login(username, password);
      if (!success) {
        Alert.alert("Error", "Invalid username or password.");
        setLoading(false);
        return;
      }
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({ pathname: "/(protected)/(tabs)/home" }),
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
          source={{
            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuADiG6jr8EQlhzn_oDCw4Xhbr_zYm_7ZJPDQ6lE7E3bv2pnBxOQ7_tgs2N0rDlfVYieM7g328L861sQmfpLsAT6YUEgeo3dMtyCCqv8wLvrM8ehcMsCuwES0vM82K1d1o5itVyFJ5dzXsPIMqT0wlSeqJbvyFnKdsNKjdw5REIyUVDksfkSjlEPZLJ4S8YrKsHiixFGsPdE_9xxgLRlKDVqWRqdvgTLhvu3VxJPvvwhIX0yluduVTiwEbKAQDrN_HZPKD7lsxF-KqcC",
          }}
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
          <TextInput
            className="bg-surface rounded-xl p-4 mb-6 w-full text-base text-primary border-none"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#a97c5a"
          />
          <TouchableOpacity
            className="bg-orange-light py-4 rounded-full w-full mb-2 shadow-md"
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text className="text-primary text-center font-bold text-xl">
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
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

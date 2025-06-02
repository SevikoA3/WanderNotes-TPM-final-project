import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useState } from "react";
import db, { eq } from "../db/db";
import { users } from "../db/schema";

interface AuthContextType {
  user: {
    id: number;
    username: string;
    createdAt: string;
    profileImage: string;
    timezone: string;
  } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateSavedUsername: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FINGERPRINT_ENABLED_KEY = "fingerprint_enabled";
const SAVED_USERNAME_KEY = "saved_username";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    createdAt: string;
    profileImage: string;
    timezone: string;
  } | null>(null);

  const login = async (username: string, password: string) => {
    // Cari user di database
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
    if (!userRow) return false;
    // If password is empty (fingerprint), skip password check
    if (password === "") {
      const { password: _, ...safeUserData } = userRow;
      setUser(safeUserData);
      await SecureStore.setItemAsync(SAVED_USERNAME_KEY, username);
      return true;
    }
    // Hash password input
    const hash = await import("expo-crypto").then((Crypto) =>
      Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
    );
    if (userRow.password !== hash) return false;
    const { password: _, ...safeUserData } = userRow;
    setUser({ ...safeUserData });
    await SecureStore.setItemAsync(SAVED_USERNAME_KEY, username);
    return true;
  };

  const logout = () => {
    setUser(null);
    SecureStore.deleteItemAsync(SAVED_USERNAME_KEY);
    SecureStore.setItemAsync(FINGERPRINT_ENABLED_KEY, "false");
  };

  const updateSavedUsername = async (username: string) => {
    await SecureStore.setItemAsync(SAVED_USERNAME_KEY, username);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateSavedUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default {};

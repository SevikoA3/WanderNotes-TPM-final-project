import React, { createContext, useContext, useState } from "react";
import db, { eq } from "../db/db";
import { users } from "../db/schema";

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    // Cari user di database
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
    if (!userRow) return false;
    // Hash password input
    const hash = await import("expo-crypto").then((Crypto) =>
      Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password)
    );
    if (userRow.password !== hash) return false;
    setUser(username);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

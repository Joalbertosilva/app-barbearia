import React, { useEffect } from "react";
import { Stack, Redirect } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/store/auth.store";

export default function RootLayout() {
  const { token, user, isHydrating, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (isHydrating) return null;

  const isAuthed = !!token && !!user;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />

      {!isAuthed ? (
        <Redirect href="/auth/login" />
      ) : user.role === "professional" ? (
        <Redirect href="/professional" />
      ) : (
        <Redirect href="/client" />
      )}
    </SafeAreaProvider>
  );
}
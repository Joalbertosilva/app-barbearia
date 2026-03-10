import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";

export default function ClientTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: "#9A9A9A",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
        tabBarIconStyle: { marginTop: 2 },

        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: "#1E1E1E",
          borderTopWidth: 1,
          height: 58 + insets.bottom,        // altura + safe area
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Loja",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
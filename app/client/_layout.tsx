import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const BORDER = "#2A2A2A";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BG,
          borderTopColor: BORDER,
          borderTopWidth: 1,
          height: 70,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: -2,
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
        name="store"
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

      <Tabs.Screen
        name="profile-photo"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="minhas-compras"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
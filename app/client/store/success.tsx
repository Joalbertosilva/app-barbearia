import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 18,
          justifyContent: "center",
        }}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={56} color={GOLD} />
          </View>

          <Text style={styles.title}>Compra realizada</Text>
          <Text style={styles.sub}>
            Seu pedido foi registrado com sucesso no sistema.
          </Text>

          <Pressable
            onPress={() => router.replace("/client/store")}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Voltar para loja</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/client/profile")}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Ir para perfil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },

  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 18,
  },
  sub: {
    color: TEXT_DIM,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  primaryBtn: {
    marginTop: 20,
    width: "100%",
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#000", fontWeight: "900" },

  secondaryBtn: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "900" },
});
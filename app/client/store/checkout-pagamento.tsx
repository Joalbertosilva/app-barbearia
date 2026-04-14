import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useCartStore } from "@/src/store/cart.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type PaymentOption = {
  key: "pix" | "credit_card" | "debit_card" | "cash";
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OPTIONS: PaymentOption[] = [
  { key: "pix", label: "Pix", sub: "Pagamento instantâneo", icon: "qr-code-outline" },
  { key: "credit_card", label: "Cartão de crédito", sub: "Parcelamento futuro", icon: "card-outline" },
  { key: "debit_card", label: "Cartão de débito", sub: "Pagamento à vista", icon: "wallet-outline" },
  { key: "cash", label: "Dinheiro", sub: "Pagamento presencial", icon: "cash-outline" },
];

export default function CheckoutPaymentScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const setPaymentMethod = useCartStore((state) => state.setPaymentMethod);

  function next() {
    if (!paymentMethod) {
      Alert.alert("Escolha um método", "Selecione uma forma de pagamento.");
      return;
    }

    router.push("/client/store/checkout-confirmacao");
  }

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 18,
        }}
      >
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>

          <Text style={styles.title}>Pagamento</Text>

          <View style={{ width: 42 }} />
        </View>

        <Text style={styles.sub}>Escolha como deseja pagar</Text>

        {OPTIONS.map((option) => {
          const active = paymentMethod === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => setPaymentMethod(option.key)}
              style={[styles.optionCard, active && styles.optionCardActive]}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={active ? "#000" : GOLD}
              />

              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, active && { color: "#000" }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionSub, active && { color: "#2A2A2A" }]}>
                  {option.sub}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={{ flex: 1 }} />

        <Pressable onPress={next} style={styles.nextBtn}>
          <Ionicons name="arrow-forward" size={18} color="#000" />
          <Text style={styles.nextBtnText}>Continuar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  sub: { color: TEXT_DIM, marginTop: 14, fontWeight: "700" },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },

  optionCard: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  optionCardActive: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  optionTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  optionSub: { color: TEXT_DIM, marginTop: 4, fontWeight: "700" },

  nextBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  nextBtnText: { color: "#000", fontWeight: "900" },
});
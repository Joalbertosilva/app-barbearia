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

export default function CheckoutDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const fulfillmentType = useCartStore((state) => state.fulfillmentType);
  const setFulfillmentType = useCartStore((state) => state.setFulfillmentType);
  const items = useCartStore((state) => state.items);

  function next() {
    if (!items.length) {
      Alert.alert("Carrinho vazio", "Adicione itens antes de continuar.");
      return;
    }

    if (!fulfillmentType) {
      Alert.alert("Escolha uma opção", "Selecione retirada ou entrega.");
      return;
    }

    router.push("/client/store/checkout-pagamento");
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

          <Text style={styles.title}>Recebimento</Text>

          <View style={{ width: 42 }} />
        </View>

        <Text style={styles.sub}>Escolha como deseja receber seu pedido</Text>

        <Pressable
          onPress={() => setFulfillmentType("pickup")}
          style={[
            styles.optionCard,
            fulfillmentType === "pickup" && styles.optionCardActive,
          ]}
        >
          <Ionicons
            name="storefront-outline"
            size={24}
            color={fulfillmentType === "pickup" ? "#000" : GOLD}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.optionTitle,
                fulfillmentType === "pickup" && { color: "#000" },
              ]}
            >
              Retirar no local
            </Text>
            <Text
              style={[
                styles.optionSub,
                fulfillmentType === "pickup" && { color: "#2A2A2A" },
              ]}
            >
              Buscar diretamente na barbearia
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setFulfillmentType("delivery")}
          style={[
            styles.optionCard,
            fulfillmentType === "delivery" && styles.optionCardActive,
          ]}
        >
          <Ionicons
            name="car-outline"
            size={24}
            color={fulfillmentType === "delivery" ? "#000" : GOLD}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.optionTitle,
                fulfillmentType === "delivery" && { color: "#000" },
              ]}
            >
              Entrega
            </Text>
            <Text
              style={[
                styles.optionSub,
                fulfillmentType === "delivery" && { color: "#2A2A2A" },
              ]}
            >
              Enviar o pedido para o endereço do cliente
            </Text>
          </View>
        </Pressable>

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
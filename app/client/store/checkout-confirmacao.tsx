import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useCartStore } from "@/src/store/cart.store";
import { formatBRLFromCents } from "@/src/utils/money";
import { api } from "@/src/services/api/api";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

function labelFulfillment(value: string | null) {
  if (value === "pickup") return "Retirada no local";
  if (value === "delivery") return "Entrega";
  return "-";
}

function labelPayment(value: string | null) {
  if (value === "pix") return "Pix";
  if (value === "credit_card") return "Cartão de crédito";
  if (value === "debit_card") return "Cartão de débito";
  if (value === "cash") return "Dinheiro";
  return "-";
}

export default function CheckoutConfirmScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotalCents());
  const fulfillmentType = useCartStore((state) => state.fulfillmentType);
  const paymentMethod = useCartStore((state) => state.paymentMethod);
  const notes = useCartStore((state) => state.notes);
  const clearCart = useCartStore((state) => state.clearCart);

  const [submitting, setSubmitting] = useState(false);

  const payload = useMemo(
    () => ({
      fulfillment_type: fulfillmentType,
      payment_method: paymentMethod,
      notes,
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    }),
    [fulfillmentType, paymentMethod, notes, items]
  );

  async function handleConfirm() {
    if (!items.length) {
      Alert.alert("Carrinho vazio", "Adicione itens antes de confirmar.");
      return;
    }

    if (!fulfillmentType || !paymentMethod) {
      Alert.alert("Dados incompletos", "Preencha recebimento e pagamento.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/orders", payload);

      clearCart();
      router.replace("/client/store/success");
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e?.response?.data?.message ?? "Não foi possível finalizar a compra."
      );
    } finally {
      setSubmitting(false);
    }
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

          <Text style={styles.title}>Confirmar pedido</Text>

          <View style={{ width: 42 }} />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.product.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, gap: 10 }}
          ListHeaderComponent={
            <>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Recebimento</Text>
                <Text style={styles.infoValue}>{labelFulfillment(fulfillmentType)}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Pagamento</Text>
                <Text style={styles.infoValue}>{labelPayment(paymentMethod)}</Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.product.name}</Text>
              <Text style={styles.itemSub}>Qtd: {item.quantity}</Text>
              <Text style={styles.itemValue}>
                {formatBRLFromCents(item.product.price_cents * item.quantity)}
              </Text>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatBRLFromCents(subtotal)}
                </Text>
              </View>

              <Pressable
                onPress={handleConfirm}
                disabled={submitting}
                style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
              >
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#000" />
                    <Text style={styles.confirmBtnText}>Finalizar compra</Text>
                  </>
                )}
              </Pressable>
            </View>
          }
        />
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

  infoCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  infoTitle: { color: TEXT_DIM, fontWeight: "700" },
  infoValue: { color: "#FFF", fontWeight: "900", marginTop: 6, fontSize: 16 },

  itemCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 14,
  },
  itemTitle: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  itemSub: { color: TEXT_DIM, marginTop: 4, fontWeight: "700" },
  itemValue: { color: GOLD, marginTop: 8, fontWeight: "900" },

  summaryCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { color: TEXT_DIM, fontWeight: "700" },
  summaryValue: { color: GOLD, fontWeight: "900", fontSize: 18 },

  confirmBtn: {
    marginTop: 16,
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  confirmBtnText: { color: "#000", fontWeight: "900" },
});
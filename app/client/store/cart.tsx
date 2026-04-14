import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useCartStore } from "@/src/store/cart.store";
import { formatBRLFromCents } from "@/src/utils/money";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotalCents());
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeItem = useCartStore((state) => state.removeItem);

  function goNext() {
    router.push("/client/store/checkout-entrega");
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

          <Text style={styles.title}>Carrinho</Text>

          <View style={{ width: 42 }} />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.product.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, gap: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
              <Text style={styles.emptySub}>
                Adicione produtos da loja para continuar.
              </Text>

              <Pressable
                onPress={() => router.replace("/client/store")}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Ir para loja</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.imageWrap}>
                  {item.product.image_url ? (
                    <Image
                      source={{ uri: item.product.image_url }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Ionicons name="cube-outline" size={22} color={GOLD} />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {formatBRLFromCents(item.product.price_cents)}
                  </Text>
                </View>

                <Pressable onPress={() => removeItem(item.product.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FFB3B3" />
                </Pressable>
              </View>

              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() => decreaseQty(item.product.id)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={18} color="#FFF" />
                </Pressable>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <Pressable
                  onPress={() => increaseQty(item.product.id)}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={18} color="#FFF" />
                </Pressable>

                <View style={{ flex: 1 }} />

                <Text style={styles.totalItem}>
                  {formatBRLFromCents(item.product.price_cents * item.quantity)}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            items.length > 0 ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    {formatBRLFromCents(subtotal)}
                  </Text>
                </View>

                <Pressable onPress={goNext} style={styles.nextBtn}>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                  <Text style={styles.nextBtnText}>Continuar compra</Text>
                </Pressable>
              </View>
            ) : null
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

  emptyBox: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 10,
  },
  emptyTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  emptySub: { color: TEXT_DIM, fontWeight: "700", lineHeight: 18 },
  emptyBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  emptyBtnText: { color: "#000", fontWeight: "900" },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  imageWrap: {
    width: 68,
    height: 68,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: CARD2,
  },
  image: { width: "100%", height: "100%" },
  imageFallback: { flex: 1, justifyContent: "center", alignItems: "center" },

  cardTitle: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  cardPrice: { color: GOLD, marginTop: 6, fontWeight: "900" },

  qtyRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { color: "#FFF", fontWeight: "900", minWidth: 20, textAlign: "center" },
  totalItem: { color: "#FFF", fontWeight: "900" },

  summaryCard: {
    marginTop: 6,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  summaryTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  summaryRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: { color: TEXT_DIM, fontWeight: "700" },
  summaryValue: { color: GOLD, fontWeight: "900", fontSize: 16 },

  nextBtn: {
    marginTop: 16,
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
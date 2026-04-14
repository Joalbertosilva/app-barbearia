import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { api } from "@/src/services/api/api";
import { formatBRLFromCents } from "@/src/utils/money";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type OrderItem = {
  id: number;
  quantity: number;
  unit_price_cents?: number;
  subtotal_cents?: number;
  product?: {
    id: number;
    name?: string;
  };
};

type Order = {
  id: number;
  status?: string;
  total_cents?: number;
  fulfillment_type?: string;
  payment_method?: string;
  created_at?: string;
  items?: OrderItem[];
};

function formatOrderDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function labelPayment(value?: string) {
  if (value === "pix") return "Pix";
  if (value === "credit_card") return "Cartão de crédito";
  if (value === "debit_card") return "Cartão de débito";
  if (value === "cash") return "Dinheiro";
  return value || "-";
}

function labelFulfillment(value?: string) {
  if (value === "pickup") return "Retirada";
  if (value === "delivery") return "Entrega";
  return value || "-";
}

export default function MyPurchasesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/my/orders");
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setItems(list);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Não foi possível carregar suas compras."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/my/orders");
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setItems(list);
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message ?? "Falha ao atualizar.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalOrders = useMemo(() => items.length, [items]);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
        }}
      >
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Minhas compras</Text>
            <Text style={styles.sub}>{totalOrders} compra(s) registrada(s)</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingTop: 18 }}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={load} style={styles.retryBtn}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 10, gap: 10 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Nenhuma compra encontrada</Text>
                <Text style={styles.emptySub}>
                  Quando você finalizar pedidos na loja, eles aparecerão aqui.
                </Text>

                <Pressable
                  onPress={() => router.push("/client/store")}
                  style={styles.emptyBtn}
                >
                  <Ionicons name="bag-outline" size={18} color="#000" />
                  <Text style={styles.emptyBtnText}>Ir para loja</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
                    <Text style={styles.cardSub}>
                      {formatOrderDate(item.created_at)} • {labelPayment(item.payment_method)}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {labelFulfillment(item.fulfillment_type)}
                    </Text>
                  </View>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.status || "novo"}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={{ gap: 6 }}>
                  {(item.items || []).slice(0, 3).map((orderItem) => (
                    <View key={orderItem.id} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {orderItem.product?.name || "Produto"}
                      </Text>
                      <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                    </View>
                  ))}

                  {(item.items || []).length > 3 && (
                    <Text style={styles.moreText}>
                      + {(item.items || []).length - 3} outro(s) item(ns)
                    </Text>
                  )}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatBRLFromCents(item.total_cents || 0)}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  sub: { color: TEXT_DIM, marginTop: 2, fontWeight: "700" },

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

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardTop: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  cardTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  cardSub: { color: "#CFCFCF", marginTop: 4, fontWeight: "700" },
  cardMeta: { color: "#9A9A9A", marginTop: 6, fontWeight: "700" },

  badge: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: { color: GOLD, fontWeight: "900", fontSize: 12 },

  divider: {
    height: 1,
    backgroundColor: "#1F1F1F",
    marginVertical: 12,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemName: { color: "#FFF", fontWeight: "700", flex: 1 },
  itemQty: { color: TEXT_DIM, fontWeight: "800" },
  moreText: { color: "#8F8F8F", fontWeight: "700", marginTop: 2 },

  totalRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: TEXT_DIM, fontWeight: "700" },
  totalValue: { color: GOLD, fontWeight: "900", fontSize: 16 },

  emptyBox: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginTop: 10,
    gap: 10,
  },
  emptyTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  emptySub: { color: TEXT_DIM, fontWeight: "700", lineHeight: 18 },
  emptyBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  emptyBtnText: { color: "#000", fontWeight: "900" },

  errorBox: {
    backgroundColor: "#2A1414",
    borderWidth: 1,
    borderColor: "#7A2D2D",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  errorText: { color: "#FFD3D3", fontWeight: "800" },
  retryBtn: {
    marginTop: 10,
    backgroundColor: GOLD,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  retryText: { color: "#000", fontWeight: "900" },
});
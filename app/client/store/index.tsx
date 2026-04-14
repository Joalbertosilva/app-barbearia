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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { api } from "@/src/services/api/api";
import { formatBRLFromCents } from "@/src/utils/money";
import { useCartStore } from "@/src/store/cart.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  stock_qty: number;
  sku?: string | null;
  image_url?: string | null;
  image_full_url?: string | null;
  is_active: boolean;
};

export default function ShopIndex() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartCount = useCartStore((state) => state.itemsCount());

  const visibleItems = useMemo(
    () => items.filter((item) => item.is_active),
    [items]
  );

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await api.get("/products");
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setItems(list);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Não foi possível carregar os produtos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const res = await api.get("/products");
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

  function goToDetails(productId: number) {
    router.push({
      pathname: "/client/store/[id]",
      params: { id: String(productId) },
    });
  }

  function goToCart() {
    router.push("/client/store/cart");
  }

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
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Loja</Text>
            <Text style={styles.sub}>Produtos premium para cabelo e barba</Text>
          </View>

          <Pressable
            onPress={goToCart}
            style={styles.cartBtn}
            accessibilityRole="button"
          >
            <Ionicons name="cart-outline" size={18} color="#000" />
            <Text style={styles.cartBtnText}>Carrinho</Text>

            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
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
            data={visibleItems}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={{ gap: 10 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 10, gap: 10 }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Nenhum produto disponível</Text>
                <Text style={styles.emptySub}>
                  Os produtos da loja ainda não foram cadastrados.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const imageUri = item.image_full_url || item.image_url || null;

              return (
                <Pressable
                  onPress={() => goToDetails(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                  ]}
                >
                  <View style={styles.imageWrap}>
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imageFallback}>
                        <Ionicons name="cube-outline" size={26} color={GOLD} />
                      </View>
                    )}
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description || "Produto premium da barbearia."}
                  </Text>

                  <View style={styles.bottomRow}>
                    <Text style={styles.price}>
                      {formatBRLFromCents(item.price_cents)}
                    </Text>
                    <Text style={styles.stock}>{item.stock_qty} un.</Text>
                  </View>

                  <View style={styles.moreBtn}>
                    <Text style={styles.moreBtnText}>Ver mais</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={styles.footerText}>Barber-MOB • Dark Premium</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  sub: { color: TEXT_DIM, marginTop: 2, fontWeight: "700" },

  cartBtn: {
    minWidth: 110,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    position: "relative",
  },
  cartBtnText: { color: "#000", fontWeight: "900" },

  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: GOLD, fontSize: 11, fontWeight: "900" },

  card: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 10,
  },

  imageWrap: {
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: CARD2,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
    minHeight: 38,
  },
  cardDesc: {
    color: TEXT_DIM,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
    minHeight: 34,
    fontWeight: "600",
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    color: GOLD,
    fontWeight: "900",
    fontSize: 15,
  },
  stock: {
    color: "#8F8F8F",
    fontWeight: "700",
    fontSize: 12,
  },

  moreBtn: {
    marginTop: 10,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  moreBtnText: {
    color: "#FFF",
    fontWeight: "900",
  },

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

  footerText: { color: "#6F6F6F", fontWeight: "800" },
});
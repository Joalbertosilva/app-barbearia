import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get(`/products/${id}`);
      const data = res.data?.data ?? res.data;

      setItem(data);
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e?.response?.data?.message ?? "Não foi possível carregar o produto."
      );
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAddToCart() {
    if (!item) return;

    addItem(item);
    Alert.alert("Carrinho", "Produto adicionado ao carrinho.");
  }

  function goToCart() {
    router.push("/client/store/cart");
  }

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#FFF" }}>Produto não encontrado.</Text>
      </View>
    );
  }
  const imageUri = item.image_full_url || item.image_url || null;

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </Pressable>

          <Text style={styles.title}>Produto</Text>

          <Pressable onPress={goToCart} style={styles.iconBtn}>
            <Ionicons name="cart-outline" size={20} color={GOLD} />
          </Pressable>
        </View>

        <View style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons name="cube-outline" size={36} color={GOLD} />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>

          <Text style={styles.price}>{formatBRLFromCents(item.price_cents)}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>Estoque: {item.stock_qty}</Text>
            </View>

            {item.sku ? (
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{item.sku}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>
            {item.description || "Produto premium da barbearia."}
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={handleAddToCart} style={styles.primaryBtn}>
              <Ionicons name="cart" size={18} color="#000" />
              <Text style={styles.primaryBtnText}>Adicionar ao carrinho</Text>
            </Pressable>

            <Pressable onPress={goToCart} style={styles.secondaryBtn}>
              <Ionicons name="bag-handle-outline" size={18} color="#FFF" />
              <Text style={styles.secondaryBtnText}>Ir para carrinho</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
  },
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

  imageWrap: {
    height: 260,
    backgroundColor: CARD,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    marginTop: 14,
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },

  name: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  price: {
    marginTop: 8,
    color: GOLD,
    fontSize: 22,
    fontWeight: "900",
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metaBadge: {
    backgroundColor: "#111",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metaBadgeText: {
    color: "#D8D8D8",
    fontWeight: "800",
    fontSize: 12,
  },

  sectionTitle: {
    marginTop: 18,
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
  },
  description: {
    color: TEXT_DIM,
    marginTop: 8,
    lineHeight: 22,
    fontWeight: "700",
  },

  actions: {
    marginTop: 20,
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: {
    color: "#000",
    fontWeight: "900",
  },

  secondaryBtn: {
    backgroundColor: CARD2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  secondaryBtnText: {
    color: "#FFF",
    fontWeight: "900",
  },
});
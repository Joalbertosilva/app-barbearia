import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/services/api/api";
import { formatBRLFromCents } from "@/src/utils/money";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type Service = {
  id: number;
  name?: string;
  title?: string;
  description?: string | null;
  price_cents?: number | null;
  duration_minutes?: number | null;
};

export default function ChooseService() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/services"); 
      const data = res.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setItems(list);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Não foi possível carregar serviços.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: tabBarHeight + 22, flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Escolher serviço</Text>
            <Text style={styles.sub}>Selecione para iniciar o agendamento</Text>
          </View>

          <Pressable onPress={() => router.back()} style={styles.backChip} accessibilityRole="button">
            <Ionicons name="chevron-back" size={18} color="#FFF" />
            <Text style={styles.backText}>Voltar</Text>
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
            data={items}
            keyExtractor={(i) => String(i.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 10, gap: 10 }}
            renderItem={({ item }) => {
              const name = item.name || item.title || "Serviço";
              const price =
                typeof item.price_cents === "number" ? formatBRLFromCents(item.price_cents) : null;
              const dur = typeof item.duration_minutes === "number" ? `${item.duration_minutes} min` : null;

              return (
                <Pressable
                  onPress={() => router.push(`/client/agenda/new?serviceId=${item.id}`)}
                  style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
                  accessibilityRole="button"
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{name}</Text>
                      {!!item.description && (
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}

                      <View style={{ flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                        {!!dur && (
                          <View style={styles.pill}>
                            <Ionicons name="time-outline" size={14} color={GOLD} />
                            <Text style={styles.pillText}>{dur}</Text>
                          </View>
                        )}
                        {!!price && (
                          <View style={styles.pill}>
                            <Ionicons name="cash-outline" size={14} color={GOLD} />
                            <Text style={styles.pillText}>{price}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#6E6E6E" />
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

  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  sub: { color: TEXT_DIM, marginTop: 2, fontWeight: "700" },

  backChip: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  backText: { color: "#FFF", fontWeight: "900" },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  cardDesc: { color: TEXT_DIM, marginTop: 6, fontWeight: "700", lineHeight: 18 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillText: { color: "#EAEAEA", fontWeight: "900", fontSize: 12 },

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
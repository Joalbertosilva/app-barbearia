import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert, RefreshControl} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native"; 
import { api } from "@/src/services/api/api";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type Appointment = {
  id: number;
  status: string;
  starts_at: string;
  service?: { name?: string; title?: string };
  professional?: { display_name?: string };
};

function safeParseDate(startsAt: string) {
  const normalized = startsAt?.includes(" ")
    ? startsAt.replace(" ", "T")
    : startsAt;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeStatus(s?: string) {
  return String(s || "").trim().toLowerCase();
}

export default function MyAgenda() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [items, setItems] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const visibleItems = useMemo(() => {
    const ok = new Set(["scheduled", "schedule", "agendado", "confirmado"]);
    return items.filter((a) => ok.has(normalizeStatus(a.status)));
  }, [items]);

  const load = useCallback(async () => {
    setError(null);

    setLoading(true);
    try {
      const res = await api.get("/my/appointments");
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setItems(list);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(" ")
          : null) ||
        "Não foi possível carregar seus agendamentos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/my/appointments");
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

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await api.get("/my/appointments");
          const data = res.data;

          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

          setItems(list);
        } catch {
        }
      })();
    }, [])
  );

  function goNew() {
    router.push("/client/agenda/service");
  }

  function confirmCancel(id: number, title: string) {
    Alert.alert("Cancelar agendamento", `Deseja cancelar "${title}"?`, [
      { text: "Não", style: "cancel" },
      { text: "Sim, cancelar", style: "destructive", onPress: () => handleCancel(id) },
    ]);
  }

  async function handleCancel(id: number) {
    try {
      setDeletingId(id);

      await api.delete(`/appointments/${id}`);

      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "canceled" } : x))
      );
    } catch (e: any) {
      Alert.alert("Erro", e?.response?.data?.message ?? "Não foi possível cancelar.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
          flex: 1,
        }}
      >
        <View style={styles.top}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Agenda</Text>
            <Text style={styles.sub}>Seus agendamentos (apenas agendados)</Text>
          </View>

          <Pressable onPress={goNew} style={styles.newBtn} accessibilityRole="button">
            <Ionicons name="add" size={18} color="#000" />
            <Text style={styles.newBtnText}>Novo</Text>
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
            keyExtractor={(i) => String(i.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 10, gap: 10 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Nenhum agendamento ativo</Text>
                <Text style={styles.emptySub}>
                  Você não tem agendamentos no momento.
                </Text>
                <Pressable onPress={goNew} style={styles.emptyBtn} accessibilityRole="button">
                  <Ionicons name="add" size={18} color="#000" />
                  <Text style={styles.emptyBtnText}>Agendar agora</Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => {
              const svc = item.service?.name || item.service?.title || "Serviço";
              const pro = item.professional?.display_name || "Profissional";

              const when = safeParseDate(item.starts_at);
              const dateStr = when
                ? when.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "-";
              const timeStr = when
                ? when.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-";

              const isDeleting = deletingId === item.id;

              return (
                <View style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{svc}</Text>
                      <Text style={styles.cardSub}>{pro}</Text>
                      <Text style={styles.cardMeta}>
                        <Text style={{ textTransform: "capitalize" }}>{dateStr}</Text> • {timeStr}
                      </Text>
                    </View>

                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => confirmCancel(item.id, svc)}
                      disabled={isDeleting}
                      style={({ pressed }) => [
                        styles.dangerBtn,
                        isDeleting && { opacity: 0.6 },
                        pressed && !isDeleting && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                      ]}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-outline" size={18} color="#FFB3B3" />
                      <Text style={styles.dangerText}>{isDeleting ? "Cancelando..." : "Cancelar"}</Text>
                    </Pressable>

                    <Pressable
                      onPress={goNew}
                      style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
                      accessibilityRole="button"
                    >
                      <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                      <Text style={styles.secondaryText}>Novo</Text>
                    </Pressable>
                  </View>
                </View>
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

  newBtn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: GOLD,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  newBtnText: { color: "#000", fontWeight: "900" },

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

  actions: { flexDirection: "row", gap: 10, marginTop: 12 },

  dangerBtn: {
    flex: 1,
    backgroundColor: "#1A0F0F",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#3A1F1F",
  },
  dangerText: { color: "#FFB3B3", fontWeight: "900" },

  secondaryBtn: {
    width: 120,
    backgroundColor: CARD2,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
  },
  secondaryText: { color: "#FFF", fontWeight: "900" },

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

  footerText: { color: "#6F6F6F", fontWeight: "800" },
});
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { api } from "@/src/services/api/api";
import { useAppointmentDraftStore } from "@/src/store/appointmentDraft.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type Slot = { time: string; available: boolean };

function buildDefaultSlots(): Slot[] {
  const slots: Slot[] = [];

  const pushRange = (startHour: number, endHour: number) => {
    for (let h = startHour; h < endHour; h++) {
      slots.push({ time: `${String(h).padStart(2, "0")}:00`, available: false });
      slots.push({ time: `${String(h).padStart(2, "0")}:30`, available: false });
    }
  };

  // ✅ conforme sua regra do backend
  pushRange(8, 12);   // 08:00..11:30
  pushRange(14, 18);  // 14:00..17:30

  return slots;
}

export default function ChooseSlot() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const professionalId = useAppointmentDraftStore((s) => s.professionalId);
  const date = useAppointmentDraftStore((s) => s.date);
  const setTime = useAppointmentDraftStore((s) => s.setTime);

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (!date) return "Horários";
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  }, [date]);

  async function load() {
    if (!professionalId || !date) return;

    setError(null);
    setLoading(true);

    // ✅ grade padrão 08–12 e 14–18
    const base = buildDefaultSlots();

    try {
      // Se você tiver esse endpoint, ele vai marcar available
      const res = await api.get(`/professionals/${professionalId}/availability`, {
        params: { date },
      });

      const apiSlots: Slot[] = Array.isArray(res.data?.slots) ? res.data.slots : [];

      // ✅ Merge: para cada slot do base, se existir na API, aplica available
      const map = new Map(apiSlots.map((s) => [s.time, s.available]));
      const merged = base.map((s) => ({
        ...s,
        available: map.has(s.time) ? Boolean(map.get(s.time)) : false,
      }));

      setSlots(merged);
    } catch {
      // ✅ se der erro na API, pelo menos mostra a grade padrão (tudo indisponível)
      setSlots(base);
      setError("Não foi possível carregar horários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [professionalId, date]);

  return (
    <View style={styles.root}>
      {/* faixa branca do topo igual Profile */}
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
        }}
      >
        <Text style={styles.title}>Escolha o horário</Text>
        <Text style={styles.sub}>{title}</Text>

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
            data={slots}
            keyExtractor={(s) => s.time}
            numColumns={3}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ gap: 10, paddingTop: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                disabled={!item.available}
                onPress={() => {
                  setTime(item.time);
                  router.push("/client/agenda/confirm");
                }}
                style={({ pressed }) => [
                  styles.slotBtn,
                  !item.available && { opacity: 0.30 },
                  pressed && item.available && { opacity: 0.90, transform: [{ scale: 0.99 }] },
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.slotText}>{item.time}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  sub: { color: TEXT_DIM, marginTop: 6, fontWeight: "700", textTransform: "capitalize" },

  slotBtn: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    alignItems: "center",
  },
  slotText: { color: "#FFF", fontWeight: "900" },

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
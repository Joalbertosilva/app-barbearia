import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAppointmentDraftStore } from "@/src/store/appointmentDraft.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function ChooseDate() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const professionalId = useAppointmentDraftStore((s) => s.professionalId);
  const setDate = useAppointmentDraftStore((s) => s.setDate);

  useEffect(() => {
    if (!professionalId) router.replace("/client/agenda/professional");
  }, [professionalId]);

  const days = useMemo(() => {
    const today = new Date();
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, i);
      const isSunday = d.getDay() === 0;
      list.push({
        iso: toISODate(d),
        label: d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" }),
        disabled: isSunday,
      });
    }
    return list;
  }, []);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: tabBarHeight + 22 }}>
        <Text style={styles.title}>Escolha a data</Text>
        <Text style={styles.sub}>Etapa 3/4 • Próximos 7 dias (domingo bloqueado)</Text>

        <FlatList
          data={days}
          keyExtractor={(i) => i.iso}
          contentContainerStyle={{ paddingTop: 12, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              disabled={item.disabled}
              onPress={() => {
                setDate(item.iso);
                router.push("/client/agenda/slots");
              }}
              style={({ pressed }) => [
                styles.card,
                item.disabled && { opacity: 0.35 },
                pressed && !item.disabled && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
            >
              <Text style={[styles.dayText, { textTransform: "capitalize" }]}>{item.label}</Text>
              {item.disabled && <Text style={styles.blocked}>Indisponível</Text>}
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  sub: { color: TEXT_DIM, fontWeight: "700", marginTop: 4 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  dayText: { color: "#FFF", fontWeight: "900" },
  blocked: { color: GOLD, fontWeight: "900", marginTop: 6 },
});
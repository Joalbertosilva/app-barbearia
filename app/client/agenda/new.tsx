import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAppointmentDraftStore } from "@/src/store/appointmentDraft.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#242424";
const TEXT_DIM = "#BDBDBD";

export default function NewAppointment() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const params = useLocalSearchParams<{ serviceId?: string }>();
  const setServiceId = useAppointmentDraftStore((s) => s.setServiceId);
  const reset = useAppointmentDraftStore((s) => s.reset);

  useEffect(() => {
    reset();
    if (params?.serviceId) setServiceId(Number(params.serviceId));
  }, [params?.serviceId]);

  return (
    <View style={styles.root}>
      {/* ✅ faixa branca do topo (EXATAMENTE como no Profile) */}
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
          gap: 14,
        }}
      >
        {/* Header (mesma pegada do Profile) */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Novo agendamento</Text>
            <Text style={styles.headerSub}>
              Etapa 1/4 • Serviço selecionado
            </Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Agenda</Text>
          </View>
        </View>

        {/* Card principal */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>

            <View style={styles.dotRow}>
              <View style={[styles.dot, styles.dotOn]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Sua melhor versão{"\n"}
            <Text style={{ color: GOLD }}>começa aqui</Text>
          </Text>

          <Text style={styles.heroDesc}>
            Próximo passo: selecione o profissional disponível para realizar o serviço.
          </Text>

          <View style={{ height: 1, backgroundColor: "#1F1F1F", marginVertical: 12 }} />

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push("/client/agenda/professional")}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>Escolher profissional</Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryBtnText}>Voltar</Text>
            </Pressable>
          </View>
        </View>

        {/* Rodapé */}
        <View style={{ alignItems: "center", marginTop: 6 }}>
          <Text style={styles.footerText}>Barber-MOB • Dark Premium</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  headerSub: { color: TEXT_DIM, marginTop: 2, fontWeight: "700" },

  badge: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: { color: GOLD, fontWeight: "900" },

  heroCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  premiumBadge: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  premiumBadgeText: { color: "#FFF", fontWeight: "900" },

  dotRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  dotOn: { backgroundColor: GOLD },

  heroTitle: { color: "#FFF", fontSize: 22, fontWeight: "900", lineHeight: 28 },
  heroDesc: { color: TEXT_DIM, fontWeight: "700", lineHeight: 20, marginTop: 8 },

  actions: { gap: 10 },

  primaryBtn: {
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#000", fontWeight: "900" },

  secondaryBtn: {
    backgroundColor: CARD2,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "900" },

  footerText: { color: "#6F6F6F", fontWeight: "800" },
});
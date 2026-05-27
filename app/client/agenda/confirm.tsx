import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { api } from "@/src/services/api/api";
import { useAppointmentDraftStore } from "@/src/store/appointmentDraft.store";
import { formatBRLFromCents } from "@/src/utils/money";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

type Service = {
  id: number;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

type Professional = {
  id: number;
  display_name: string;
};

function formatDatePtBR(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
}

function buildLocalDatetime(dateISO: string, timeHHMM: string) {
  // "YYYY-MM-DD HH:mm:ss" (local, sem timezone)
  return `${dateISO} ${timeHHMM}:00`;
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, capitalize && { textTransform: "capitalize" }]}>{value}</Text>
    </View>
  );
}

export default function ConfirmAppointment() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const serviceId = useAppointmentDraftStore((s) => s.serviceId);
  const serviceNameDraft = useAppointmentDraftStore((s) => s.serviceName);
  const serviceDurationDraft = useAppointmentDraftStore((s) => s.serviceDurationMinutes);
  const servicePriceDraft = useAppointmentDraftStore((s) => s.servicePriceCents);
  const professionalId = useAppointmentDraftStore((s) => s.professionalId);
  const professionalNameDraft = useAppointmentDraftStore((s) => s.professionalName);
  const date = useAppointmentDraftStore((s) => s.date);
  const time = useAppointmentDraftStore((s) => s.time);
  const reset = useAppointmentDraftStore((s) => s.reset);

  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ guard do fluxo — SEM navegar no render
  useEffect(() => {
    if (!serviceId) router.replace("/client");
    else if (!professionalId) router.replace("/client/agenda/professional");
    else if (!date) router.replace("/client/agenda/date");
    else if (!time) router.replace("/client/agenda/slots");
  }, [serviceId, professionalId, date, time]);

  useEffect(() => {
    if (!serviceId || !professionalId) return;
    // A tela de confirmação mostra primeiro o que já foi escolhido no fluxo.
    // Busca de API é apenas complementar, sem travar a UI.
    let mounted = true;
    setLoading(false);
    void (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          api.get(`/services/${serviceId}`),
          api.get(`/professionals/${professionalId}`),
        ]);
        if (!mounted) return;
        setService(sRes.data ?? null);
        setProfessional(pRes.data ?? null);
      } catch {
        // best-effort
      }
    })();
    return () => {
      mounted = false;
    };
  }, [serviceId, professionalId]);

  const prettyDate = useMemo(() => (date ? formatDatePtBR(date) : "-"), [date]);
  const startsAtLocal = useMemo(() => (date && time ? buildLocalDatetime(date, time) : ""), [date, time]);

  async function handleConfirm() {
    if (!serviceId || !professionalId || !date || !time) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post("/appointments", {
        service_id: serviceId,
        professional_id: professionalId,
        date,
        time,
        starts_at: startsAtLocal, // ✅ local "YYYY-MM-DD HH:mm:ss" (evita -3h)
      });

      // Pequena espera para feedback visual de carregamento (sem demorar demais).
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubmitting(false);
      Alert.alert("Agendamento confirmado", "Seu horário foi agendado com sucesso.", [
        {
          text: "OK",
          onPress: () => {
            reset();
            router.replace("/client/agenda");
          },
        },
      ]);
      return;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Erro ao confirmar agendamento.";
      const errors = e?.response?.data?.errors;
      const details = errors ? Object.values(errors).flat().join("\n") : "";
      setError(details ? `${msg}\n${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 14,
          paddingBottom: tabBarHeight + 22,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Confirmar</Text>
            <Text style={styles.sub}>Etapa 4/4 • Revise os dados</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Agenda</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ paddingTop: 18 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Resumo</Text>
              <View style={styles.divider} />

              <Row label="Serviço" value={service?.name ?? serviceNameDraft ?? "-"} />
              <Row
                label="Profissional"
                value={professional?.display_name ?? professionalNameDraft ?? "-"}
              />
              <Row label="Data" value={prettyDate} capitalize />
              <Row label="Horário" value={time ?? "-"} />
              <Row
                label="Duração"
                value={
                  (service?.duration_minutes ?? serviceDurationDraft)
                    ? `${service?.duration_minutes ?? serviceDurationDraft} min`
                    : "-"
                }
              />
              <Row
                label="Valor"
                value={
                  typeof (service?.price_cents ?? servicePriceDraft) === "number"
                    ? formatBRLFromCents((service?.price_cents ?? servicePriceDraft) as number)
                    : "-"
                }
              />
            </View>

            <Pressable
              onPress={handleConfirm}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryBtn,
                submitting && { opacity: 0.6 },
                pressed && !submitting && { opacity: 0.92, transform: [{ scale: 0.99 }] },
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>{submitting ? "Confirmando..." : "Confirmar agendamento"}</Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Voltar</Text>
            </Pressable>

            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Text style={styles.footerText}>Barber-MOB • Dark Premium</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  sub: { color: TEXT_DIM, fontWeight: "700", marginTop: 4 },

  badge: {
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: { color: GOLD, fontWeight: "900" },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  cardTitle: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  divider: { height: 1, backgroundColor: "#1F1F1F", marginVertical: 12 },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  label: { color: TEXT_DIM, fontWeight: "800" },
  value: { color: "#FFF", fontWeight: "900", textAlign: "right", flex: 1 },

  primaryBtn: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
  },
  primaryText: { color: "#000", fontWeight: "900" },

  secondaryBtn: {
    backgroundColor: CARD2,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  secondaryText: { color: "#FFF", fontWeight: "900" },

  errorBox: {
    backgroundColor: "#2A1414",
    borderWidth: 1,
    borderColor: "#7A2D2D",
    padding: 12,
    borderRadius: 12,
  },
  errorText: { color: "#FFD3D3", fontWeight: "800" },

  footerText: { color: "#6F6F6F", fontWeight: "800" },
});
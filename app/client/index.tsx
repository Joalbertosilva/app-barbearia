import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { api } from "@/src/services/api/api";
import { useAuthStore } from "@/src/store/auth.store";
import { formatBRLFromCents } from "@/src/utils/money";
import { SafeAreaView } from "react-native-safe-area-context";
type Service = {
  id: number;
  name: string;
  description?: string | null;
  price_cents: number;
  duration_minutes: number;
};

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#1C1C1C";

export default function ClientHome() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);

  const goHome = useCallback(() => {
    router.replace("/client");
  }, []);

  async function loadServices() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Não foi possível carregar os serviços agora.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  function ServiceCard({ item }: { item: Service }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>

          <View style={styles.badge} accessibilityLabel="Indicador de destaque">
            <Text style={styles.badgeText}>✂️</Text>
          </View>
        </View>

        {!!item.description && (
          <Text style={styles.cardDesc}>{item.description}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.price}>{formatBRLFromCents(item.price_cents)}</Text>

          <Text style={styles.meta}>
            {item.duration_minutes ? `${item.duration_minutes} min` : ""}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryBtn}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/client/agenda/new",
                params: { serviceId: String(item.id) },
              })
            }
          >
            <Text style={styles.primaryBtnText}>Agendar</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/client/agenda/new",
                params: { serviceId: String(item.id) },
              })
            }
          >
            <Text style={styles.secondaryBtnText}>Ver mais</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { height: insets.top }]} />
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safe}>
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.container}>
            <View style={styles.errorBox} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>

              <Pressable
                onPress={loadServices}
                style={styles.retryBtn}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ServiceCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingBottom: tabBarHeight + 18,
              paddingTop: 10,
            }}
            ListHeaderComponent={
              <View style={{ paddingBottom: 10 }}>
                <View style={styles.header}>
                  <View>
                    <Text style={styles.headerHello}>Olá,</Text>
                    <Text style={styles.headerName}>{user?.name || "Cliente"}</Text>
                  </View>

                  <Pressable
                    onPress={goHome}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar para a tela inicial"
                  >
                    <Image
                      source={require("../../assets/images/logo-oficial.jpg")}
                      style={styles.avatar}
                    />
                  </Pressable>
                </View>

                <View style={styles.hero}>
                  <Text style={styles.heroTitle} accessibilityRole="header">
                    Sua melhor versão{"\n"}
                    <Text style={styles.heroHighlight}>começa aqui</Text>
                  </Text>

                  <Text style={styles.heroSubtitle}>
                    Cortes modernos, barba impecável e produtos premium.
                  </Text>

                  <View style={styles.heroButtons}>
                    <Pressable
                      style={styles.heroBtnPrimary}
                      accessibilityRole="button"
                      onPress={() => router.push("/client/agenda")}
                    >
                      <Text style={styles.heroBtnPrimaryText}>Agendar Horário</Text>
                    </Pressable>

                    <Pressable
                      style={styles.heroBtnSecondary}
                      accessibilityRole="button"
                      onPress={() => router.push("/client/store")}
                    >
                      <Text style={styles.heroBtnSecondaryText}>Visitar Loja</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Serviços</Text>

                  <Pressable
                    onPress={loadServices}
                    accessibilityRole="button"
                    hitSlop={10}
                  >
                    <Text style={styles.refreshText}>Atualizar</Text>
                  </Pressable>
                </View>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topBar: { width: "100%", backgroundColor: "#FFF" },
  safe: { flex: 1, backgroundColor: BG },

  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 18 },
  centerLoading: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerHello: { color: "#CFCFCF", fontSize: 14 },
  headerName: { color: "#FFF", fontSize: 18, fontWeight: "900" },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#1A1A1A",
  },

  hero: {
    backgroundColor: "#121212",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#242424",
    marginBottom: 14,
  },
  heroTitle: { color: "#FFF", fontSize: 26, fontWeight: "900", lineHeight: 32 },
  heroHighlight: { color: GOLD },
  heroSubtitle: { color: "#D7D7D7", marginTop: 6, fontSize: 14 },

  heroButtons: { flexDirection: "row", gap: 10, marginTop: 12 },
  heroBtnPrimary: {
    flex: 1,
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  heroBtnPrimaryText: { color: "#000", fontWeight: "900" },
  heroBtnSecondary: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  heroBtnSecondaryText: { color: "#FFF", fontWeight: "900" },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  refreshText: { color: GOLD, fontWeight: "900" },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  badge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2F2F2F",
  },
  badgeText: { color: GOLD, fontWeight: "900" },

  cardDesc: { color: "#CFCFCF", marginTop: 8, fontSize: 13, lineHeight: 18 },

  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  price: { color: GOLD, fontWeight: "900" },
  meta: { color: "#CFCFCF", fontWeight: "700" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  primaryBtnText: { color: "#FFF", fontWeight: "900" },

  secondaryBtn: {
    width: 110,
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "800" },

  errorBox: {
    backgroundColor: "#2A1414",
    borderColor: "#7A2D2D",
    borderWidth: 1,
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
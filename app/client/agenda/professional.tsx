import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from "react-native";
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

type Professional = {
  id: number;
  display_name: string;
  bio?: string | null;
  photo_url?: string | null;
};

export default function ChooseProfessional() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const setProfessionalId = useAppointmentDraftStore((s) => s.setProfessionalId);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Professional[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.get("/professionals");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Não foi possível carregar profissionais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: "#FFF" }} />

      <View style={{
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: tabBarHeight + 22
      }}>
        <Text style={styles.title}>Escolha o profissional</Text>
        <Text style={styles.subtitle}>Etapa 2/4</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 18 }} />
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
            contentContainerStyle={{ paddingTop: 12 }}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.92 }
                ]}
                onPress={() => {
                  setProfessionalId(item.id);
                  router.push("/client/agenda/date");
                }}
              >
                <View style={styles.row}>
                  <Image
                    source={require("../../../assets/images/logo-oficial.jpg")}
                    style={styles.avatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.display_name}</Text>
                    {!!item.bio && (
                      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
                    )}
                  </View>
                </View>
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
  subtitle: { color: TEXT_DIM, fontWeight: "700", marginTop: 4 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10
  },

  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: BORDER },

  name: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  bio: { color: TEXT_DIM, marginTop: 4, fontWeight: "700" },

  errorBox: {
    backgroundColor: "#2A1414",
    borderWidth: 1,
    borderColor: "#7A2D2D",
    padding: 12,
    borderRadius: 12,
    marginTop: 12
  },
  errorText: { color: "#FFD3D3", fontWeight: "800" },
  retryBtn: {
    marginTop: 10,
    backgroundColor: GOLD,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  retryText: { color: "#000", fontWeight: "900" }
});
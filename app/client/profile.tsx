import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView,} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/src/store/auth.store";
import { logout } from "@/src/services/api/auth";

type StatCardProps = {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const CARD2 = "#1C1C1C";
const BORDER = "#242424";
const TEXT_DIM = "#BDBDBD";

function StatCard({ title, value, icon, onPress }: StatCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
    >
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={18} color={GOLD} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#6E6E6E" />
    </Pressable>
  );
}

function RowAction({
  icon,
  label,
  hint,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { opacity: 0.9 },
        danger && { borderColor: "#3A1F1F", backgroundColor: "#1A0F0F" },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
    >
      <View
        style={[
          styles.rowIconWrap,
          danger && { backgroundColor: "#241111", borderColor: "#3A1F1F" },
        ]}
      >
        <Ionicons name={icon} size={18} color={danger ? "#FF8A8A" : GOLD} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: "#FFB3B3" }]}>
          {label}
        </Text>
        {!!hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#6E6E6E" />
    </Pressable>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const stats = useMemo(
    () => ({
      appointments: 0,
      cartItems: 0,
      purchases: 0,
    }),
    []
  );

  async function handleLogout() {
    try {
      await logout();
    } catch {}
    await clearAuth();
    router.replace("/auth/login");
  }

  function goHome() {
    router.replace("/client");
  }

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
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Perfil</Text>
            <Text style={styles.headerSub}>
              {user?.name || "Cliente"}
              {user?.email ? ` • ${user.email}` : ""}
            </Text>
          </View>

          <Pressable onPress={goHome} accessibilityRole="button">
            <Image
              source={require("../../assets/images/logo-oficial.jpg")}
              style={styles.avatar}
            />
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardTop}>
            <View style={styles.profileBadge}>
              <Ionicons name="sparkles" size={16} color={GOLD} />
              <Text style={styles.profileBadgeText}>Premium</Text>
            </View>

            <Pressable
              onPress={() => {}}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              style={styles.editChip}
            >
              <Ionicons name="create-outline" size={16} color="#FFF" />
              <Text style={styles.editChipText}>Editar</Text>
            </Pressable>
          </View>

          <Text style={styles.profileName}>{user?.name || "Cliente"}</Text>
          <Text style={styles.profileMeta}>
            {user?.email || "Conta Barber-MOB"}
          </Text>

          <View style={styles.profileDivider} />

          <View style={styles.quickActions}>
            <Pressable
              style={styles.quickBtnPrimary}
              onPress={() => router.push("/client/agenda")}
              accessibilityRole="button"
            >
              <Ionicons name="calendar" size={18} color="#000" />
              <Text style={styles.quickBtnPrimaryText}>Meus agendamentos</Text>
            </Pressable>

            <Pressable
              style={styles.quickBtn}
              onPress={() => router.push("/client/shop")}
              accessibilityRole="button"
            >
              <Ionicons name="bag" size={18} color="#FFF" />
              <Text style={styles.quickBtnText}>Loja</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Resumo</Text>

        <View style={{ gap: 10 }}>
          <StatCard
            title="Agendamentos"
            value={`${stats.appointments}`}
            icon="cut"
            onPress={() => router.push("/client/agenda")}
          />
          <StatCard
            title="Carrinho"
            value={`${stats.cartItems} item(ns)`}
            icon="cart"
            onPress={() => router.push("/client/shop")}
          />
          <StatCard
            title="Compras"
            value={`${stats.purchases}`}
            icon="receipt"
            onPress={() => router.push("/client/shop")}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Conta</Text>

        <View style={{ gap: 10 }}>
          <RowAction
            icon="person-circle"
            label="Dados do perfil"
            hint="Nome, telefone, preferências"
            onPress={() => {}}
          />
          <RowAction
            icon="card"
            label="Pagamentos"
            hint="Métodos e histórico"
            onPress={() => {}}
          />
          <RowAction
            icon="help-circle"
            label="Ajuda e suporte"
            hint="Fale com a barbearia"
            onPress={() => {}}
          />
          <RowAction
            icon="log-out"
            label="Sair"
            hint="Encerrar sessão com segurança"
            danger
            onPress={handleLogout}
          />
        </View>

        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Text style={styles.footerText}>Barber-MOB • Dark Premium</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  headerSub: { color: TEXT_DIM, marginTop: 2, fontWeight: "700" },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    backgroundColor: "#1A1A1A",
  },

  profileCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 14,
  },
  profileCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  profileBadgeText: { color: "#FFF", fontWeight: "900" },

  editChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  editChipText: { color: "#FFF", fontWeight: "900" },

  profileName: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  profileMeta: { color: TEXT_DIM, marginTop: 4, fontWeight: "700" },

  profileDivider: {
    height: 1,
    backgroundColor: "#1F1F1F",
    marginVertical: 12,
  },

  quickActions: { flexDirection: "row", gap: 10 },
  quickBtnPrimary: {
    flex: 1,
    backgroundColor: GOLD,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  quickBtnPrimaryText: { color: "#000", fontWeight: "900" },

  quickBtn: {
    width: 120,
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  quickBtnText: { color: "#FFF", fontWeight: "900" },

  sectionTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 6,
  },

  statCard: {
    backgroundColor: CARD2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131313",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statTitle: { color: "#EAEAEA", fontWeight: "900" },
  statValue: { color: TEXT_DIM, fontWeight: "800", marginTop: 2 },

  row: {
    backgroundColor: CARD2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131313",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  rowLabel: { color: "#FFF", fontWeight: "900" },
  rowHint: { color: TEXT_DIM, fontWeight: "700", marginTop: 2 },

  footerText: { color: "#6F6F6F", fontWeight: "800" },
});
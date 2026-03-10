import React from "react";
import { View, Text } from "react-native";
import { useAuthStore } from "../../src/store/auth.store";

export default function ProfessionalHome() {
  const user = useAuthStore((s) => s.user);

  return (
    <View style={{ padding: 18, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>Profissional</Text>
      <Text>Bem-vindo, {user?.name}</Text>
      <Text>Próximo passo: agenda da semana/dia</Text>
    </View>
  );
}

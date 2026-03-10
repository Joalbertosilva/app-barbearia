import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BG = "#0F0F0F";

export default function Shop() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sacola / Loja</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 18 },
  title: { color: "#FFF", fontSize: 20, fontWeight: "900" },
});
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { forgotPassword } from "@/src/services/api/auth";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#1C1C1C";

const Schema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Email inválido (ex: nome@dominio.com).")
    .required("Informe seu email."),
});

export default function ForgotPasswordScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleForgot(email: string) {
    setMessage(null);
    setApiError(null);
    try {
      await forgotPassword(email.trim());
      setMessage("Enviamos um link de redefinição para seu email.");
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Não foi possível enviar o email agora.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Formik
        initialValues={{ email: "" }}
        validationSchema={Schema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleForgot(values.email);
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
        }) => (
          <View style={styles.inner}>
            <Text style={styles.title}>
              Esqueci minha{"\n"}
              <Text style={styles.highlight}>senha</Text>
            </Text>
            <Text style={styles.subtitle}>
              Informe seu email para receber o link de redefinição.
            </Text>

            {!!apiError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            )}
            {!!message && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{message}</Text>
              </View>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="ex: silva@gmail.com"
              placeholderTextColor="#8E8E8E"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
            />
            {touched.email && errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <Pressable
              onPress={() => handleSubmit()}
              disabled={isSubmitting || !isValid}
              style={({ pressed }) => [
                styles.button,
                (isSubmitting || !isValid) && styles.buttonDisabled,
                pressed && !(isSubmitting || !isValid) ? styles.buttonPressed : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Enviar link</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Voltar</Text>
            </Pressable>

            <Link href="/auth/login" style={styles.link}>
              Ir para login
            </Link>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: "center", padding: 24 },
  inner: { gap: 10 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900", lineHeight: 36 },
  highlight: { color: GOLD },
  subtitle: { color: "#D7D7D7", fontSize: 15, marginBottom: 8 },
  label: { color: "#F1F1F1", fontSize: 15, fontWeight: "800", marginTop: 6 },
  input: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    fontSize: 16,
  },
  inputError: { borderColor: "#D94C4C" },
  fieldError: { color: "#FFD3D3", fontSize: 13, fontWeight: "700", marginTop: 6 },
  errorBox: {
    backgroundColor: "#2A1414",
    borderColor: "#7A2D2D",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  errorText: { color: "#FFD3D3", fontSize: 14, fontWeight: "800" },
  successBox: {
    backgroundColor: "#132214",
    borderColor: "#255A2A",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  successText: { color: "#C8F2CD", fontSize: 14, fontWeight: "800" },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonPressed: { transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { fontWeight: "900", color: "#000", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginTop: 8,
  },
  secondaryText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  link: { color: GOLD, textAlign: "center", marginTop: 12, fontSize: 15, fontWeight: "800" },
});

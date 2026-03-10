import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image,} 
from "react-native";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { register } from "@/src/services/api/auth";
import { useAuthStore } from "@/src/store/auth.store";

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, "Digite seu nome (mínimo 2 caracteres).")
    .required("Informe seu nome."),
  email: Yup.string()
    .trim()
    .email("Email inválido (ex: nome@dominio.com).")
    .required("Informe seu email."),
  password: Yup.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .required("Informe sua senha."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não coincidem.")
    .required("Confirme sua senha."),
});

export default function RegisterScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  async function doRegister(name: string, email: string, password: string) {
    setApiError(null);

    try {
      const data = await register(name.trim(), email.trim(), password);

      if (!data?.token || !data?.user) {
        setApiError("Resposta inesperada. Tente novamente.");
        return;
      }

      await setAuth(data.user, data.token);

      const role = String(data.user?.role || "").toLowerCase();
      if (role === "professional" || role === "admin") router.replace("/professional");
      else router.replace("/client");
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 422) setApiError(msg || "Dados inválidos. Verifique e tente novamente.");
      else setApiError(msg || "Não foi possível cadastrar agora. Tente novamente.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Formik
        initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
        validationSchema={RegisterSchema}
        validateOnBlur
        validateOnChange
        onSubmit={async (values, { setSubmitting }) => {
          await doRegister(values.name, values.email, values.password);
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
            <View style={styles.logoContainer} accessible accessibilityLabel="Logo Barber-Mob">
              <Image
                source={require("../../assets/images/logo-oficial.jpg")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title} accessibilityRole="header">
              Crie sua{"\n"}
              <Text style={styles.highlight}>conta agora</Text>
            </Text>

            <Text style={styles.subtitle}>Cadastre-se para agendar e acompanhar seus pedidos.</Text>

            {apiError ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Nome</Text>
            <TextInput
              placeholder="ex: João Silva"
              placeholderTextColor="#8E8E8E"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              style={[styles.input, touched.name && errors.name ? styles.inputError : null]}
              accessibilityLabel="Campo de nome"
            />
            {touched.name && errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

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
              accessibilityLabel="Campo de email"
            />
            {touched.email && errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="mínimo 6 caracteres"
              placeholderTextColor="#8E8E8E"
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              secureTextEntry
              style={[styles.input, touched.password && errors.password ? styles.inputError : null]}
              accessibilityLabel="Campo de senha"
            />
            {touched.password && errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}

            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              placeholder="repita sua senha"
              placeholderTextColor="#8E8E8E"
              value={values.confirmPassword}
              onChangeText={handleChange("confirmPassword")}
              onBlur={handleBlur("confirmPassword")}
              secureTextEntry
              style={[
                styles.input,
                touched.confirmPassword && errors.confirmPassword ? styles.inputError : null,
              ]}
              accessibilityLabel="Campo de confirmação de senha"
            />
            {touched.confirmPassword && errors.confirmPassword ? (
              <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
            ) : null}

            <Pressable
              onPress={() => handleSubmit()}
              disabled={isSubmitting || !isValid}
              style={({ pressed }) => [
                styles.button,
                (isSubmitting || !isValid) && styles.buttonDisabled,
                pressed && !(isSubmitting || !isValid) ? styles.buttonPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar"
            >
              {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
            </Pressable>

            <Link href="/auth/login" style={styles.link}>
              Já tenho conta
            </Link>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#1C1C1C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: "center", padding: 24 },
  inner: { gap: 10 },

  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1A1A1A",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: { width: 82, height: 82, borderRadius: 41 },

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

  link: { color: GOLD, textAlign: "center", marginTop: 12, fontSize: 15, fontWeight: "800" },
});
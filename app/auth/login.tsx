import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image,} 
from "react-native";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import { api } from "@/src/services/api/api";
import { useAuthStore } from "@/src/store/auth.store";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Email inválido (ex: nome@dominio.com).")
    .required("Informe seu email."),
  password: Yup.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres.")
    .required("Informe sua senha."),
});

export default function LoginScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  async function doLogin(email: string, password: string) {
    setApiError(null);

    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        setApiError("Resposta inesperada. Tente novamente.");
        return;
      }

      await setAuth(user, token);

      const role = String(user?.role || user?.type || "").toLowerCase();
      if (role === "professional" || role === "barber" || role === "admin") {
        router.replace("/professional");
      } else {
        router.replace("/client");
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;

      if (status === 401) setApiError("Email ou senha inválidos.");
      else if (status === 422) setApiError(msg || "Dados inválidos. Verifique e tente novamente.");
      else setApiError(msg || "Não foi possível entrar agora. Tente novamente.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        validateOnBlur={true}
        validateOnChange={true} 
        onSubmit={async (values, { setSubmitting }) => {
          await doLogin(values.email, values.password);
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
              Sua melhor versão{"\n"}
              <Text style={styles.highlight}>começa aqui</Text>
            </Text>

            <Text style={styles.subtitle}>
              Agende horários e aproveite produtos premium.
            </Text>

            {apiError ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="ex: silva@gmail.com"
              placeholderTextColor="#8E8E8E"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                touched.email && errors.email ? styles.inputError : null,
              ]}
              accessibilityLabel="Campo de email"
              accessibilityHint="Digite seu email para entrar"
            />
            {touched.email && errors.email ? (
              <Text style={styles.fieldError}>{errors.email}</Text>
            ) : null}

            <Text style={styles.label}>Senha</Text>
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor="#8E8E8E"
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              secureTextEntry
              style={[
                styles.input,
                touched.password && errors.password ? styles.inputError : null,
              ]}
              accessibilityLabel="Campo de senha"
              accessibilityHint="Digite sua senha para entrar"
            />
            {touched.password && errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
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
              accessibilityLabel="Entrar"
              accessibilityHint="Tenta fazer login"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>

            <Link href="/auth/forgot-password" style={styles.forgotLink}>
              Esqueci minha senha
            </Link>

            <Link href="/auth/register" style={styles.link}>
              Criar conta
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
  inputError: {
    borderColor: "#D94C4C",
  },

  fieldError: {
    color: "#FFD3D3",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },

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

  forgotLink: { color: "#D7D7D7", textAlign: "center", marginTop: 10, fontSize: 14, fontWeight: "700" },
  link: { color: GOLD, textAlign: "center", marginTop: 12, fontSize: 15, fontWeight: "800" },
});
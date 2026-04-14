import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useProfileStore } from "@/src/store/profile.store";

const GOLD = "#E0B04F";
const BG = "#0F0F0F";
const CARD = "#141414";
const BORDER = "#2A2A2A";
const TEXT_DIM = "#BDBDBD";

export default function ProfilePhotoScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [saving, setSaving] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  const setAvatarUri = useProfileStore((state) => state.setAvatarUri);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  async function handleTakePhoto() {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        setCapturedUri(photo.uri);
      }
    } catch {
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  }

  async function handleSavePhoto() {
    if (!capturedUri) return;

    try {
      setSaving(true);
      setAvatarUri(capturedUri);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (!permission) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center, { padding: 24 }]}>
        <Text style={styles.title}>Permissão da câmera</Text>
        <Text style={styles.subCenter}>
          Precisamos da câmera para você definir sua foto de perfil.
        </Text>

        <Pressable onPress={requestPermission} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Permitir câmera</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: BG }} />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFF" />
        </Pressable>

        <Text style={styles.title}>Foto de perfil</Text>

        <Pressable
          onPress={() =>
            setFacing((prev) => (prev === "front" ? "back" : "front"))
          }
          style={styles.iconBtn}
        >
          <Ionicons name="camera-reverse-outline" size={20} color={GOLD} />
        </Pressable>
      </View>

      {capturedUri ? (
        <View style={{ flex: 1, paddingHorizontal: 18 }}>
          <View style={styles.previewWrap}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} />
          </View>

          <View style={{ marginTop: 16, gap: 10, paddingBottom: tabBarHeight + 16 }}>
            <Pressable
              onPress={handleSavePhoto}
              style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#000" />
                  <Text style={styles.primaryBtnText}>Salvar foto</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => setCapturedUri(null)}
              style={styles.secondaryBtn}
            >
              <Ionicons name="refresh-outline" size={18} color="#FFF" />
              <Text style={styles.secondaryBtnText}>Tirar novamente</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
          </View>

          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 16,
              paddingBottom: tabBarHeight + 16,
            }}
          >
            <Text style={styles.subCenter}>
              Centralize seu rosto e capture a foto.
            </Text>

            <View style={styles.actions}>
              <Pressable onPress={handleTakePhoto} style={styles.captureBtn}>
                <Ionicons name="camera" size={22} color="#000" />
                <Text style={styles.captureBtnText}>Capturar</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  center: { justifyContent: "center", alignItems: "center" },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  subCenter: {
    color: TEXT_DIM,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraWrap: {
    flex: 1,
    paddingHorizontal: 18,
  },
  camera: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
  },

  previewWrap: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },

  actions: {
    marginTop: 16,
    alignItems: "center",
  },

  captureBtn: {
    width: "100%",
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  captureBtnText: { color: "#000", fontWeight: "900" },

  primaryBtn: {
    width: "100%",
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnText: { color: "#000", fontWeight: "900" },

  secondaryBtn: {
    width: "100%",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  secondaryBtnText: { color: "#FFF", fontWeight: "900" },
});
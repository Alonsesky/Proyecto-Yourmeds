import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AuthContext } from "./context/AuthContext";

const BLUE = "#007BFF";

export default function IndexScreen() {
  const router = useRouter();
  const { hasSession, loading } = useContext(AuthContext);

  // 1) Efecto para redirigir cuando ya tenemos sesión
  useEffect(() => {
    if (hasSession) {
      router.replace("/(app)/home");
    }
  }, [hasSession, router]);

  // 2) Mientras se revisa el token, muestra un loader
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 3) Si hasSession ya es true, evitar parpadeo extra
  if (hasSession) {
    return null;
  }

  // 4) Si NO hay sesión, mostramos la pantalla de bienvenida
  return (
    <View style={styles.container}>
      <Text style={styles.title}>YourMeds</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={styles.buttonText}>Empezar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: BLUE,
    marginBottom: 40,
  },
  button: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

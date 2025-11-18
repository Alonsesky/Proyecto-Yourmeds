import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiGroupsResponse } from "../types/groupTypes";


// ===========================
// ALARMAS (para notificaciones locales)
// ===========================

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

// ===========================
// TOKEN
// ===========================
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ===========================
// USER ID
// ===========================
export async function saveUserId(id: string) {
  await AsyncStorage.setItem(USER_ID_KEY, id);
}

export async function getSavedUserId(): Promise<number | null> {
  const id = await AsyncStorage.getItem(USER_ID_KEY);
  return id ? Number(id) : null;
}

export async function removeUserId() {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

// ===========================
// LIMPIAR SESIÓN COMPLETA
// ===========================
export async function clearSession() {
  const keys = await AsyncStorage.getAllKeys();
  const filtered = keys.filter(k =>
    k === TOKEN_KEY ||
    k === USER_ID_KEY ||
    k.startsWith("groups_snapshot_")
  );
  await AsyncStorage.multiRemove(filtered);
}

// ===========================
// SNAPSHOT por usuario
// ===========================
export async function saveGroupsSnapshot(payload: ApiGroupsResponse) {
  const userId = await getSavedUserId();
  if (!userId) return; // seguridad

  const wrapped = { savedAt: Date.now(), data: payload };
  await AsyncStorage.setItem(`groups_snapshot_${userId}`, JSON.stringify(wrapped));
}

export async function getGroupsSnapshot(): Promise<{
  savedAt: number; data: ApiGroupsResponse;
} | null> {
  const userId = await getSavedUserId();
  if (!userId) return null;

  const raw = await AsyncStorage.getItem(`groups_snapshot_${userId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.savedAt === "number" && parsed.data?.groups) {
      return parsed as { savedAt: number; data: ApiGroupsResponse };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearGroupsSnapshot() {
  const userId = await getSavedUserId();
  if (!userId) return;
  await AsyncStorage.removeItem(`groups_snapshot_${userId}`);
}

// ===============================
// Snapshot de alarmas para notificaciones
// ===============================
const ALARMS_KEY = "alarms_snapshot";

export async function saveAlarmsSnapshot(alarms: any[]) {
  const wrapped = {
    savedAt: Date.now(),
    data: alarms,
  };
  try {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(wrapped));
  } catch (e) {
    console.warn("[storage] No se pudo guardar snapshot de alarmas", e);
  }
}

export async function getAlarmsSnapshot(): Promise<{ savedAt: number; data: any[] } | null> {
  try {
    const raw = await AsyncStorage.getItem(ALARMS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.data)) return parsed;
    return null;
  } catch (e) {
    console.warn("[storage] No se pudo leer snapshot de alarmas", e);
    return null;
  }
}

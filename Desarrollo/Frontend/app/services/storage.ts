import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiGroupsResponse } from "../types/groupTypes";

// ===========================
// CLAVES
// ===========================
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";
const ALARMS_KEY = "alarms_snapshot";

// ===========================
// TOKEN
// ===========================
export async function saveToken(token: string) {
  if (!token) {
    console.warn("[saveToken] token vacío, removiendo auth_token");
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
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
export async function saveUserId(id: string | number) {
  const str = String(id);
  if (!str) return;
  await AsyncStorage.setItem(USER_ID_KEY, str);
}

export async function getSavedUserId(): Promise<number | null> {
  const v = await AsyncStorage.getItem(USER_ID_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export async function clearUserId() {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

// ===========================
// SNAPSHOT por usuario (GRUPOS)
// ===========================
function groupsKeyForUser(userId: number) {
  return `groups_snapshot_${userId}`;
}

export async function saveGroupsSnapshot(payload: ApiGroupsResponse) {
  const userId = await getSavedUserId();
  if (!userId) return; // seguridad

  const wrapped = { savedAt: Date.now(), data: payload };
  await AsyncStorage.setItem(groupsKeyForUser(userId), JSON.stringify(wrapped));
}

export async function getGroupsSnapshot(): Promise<{
  savedAt: number;
  data: ApiGroupsResponse;
} | null> {
  const userId = await getSavedUserId();
  if (!userId) return null;

  const raw = await AsyncStorage.getItem(groupsKeyForUser(userId));
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
  await AsyncStorage.removeItem(groupsKeyForUser(userId));
}

// ===============================
// Snapshot de ALARMAS para notificaciones
// ===============================
export async function saveAlarmsSnapshot(alarms: any[]) {
  if (!alarms || !Array.isArray(alarms)) {
    console.warn("[storage] saveAlarmsSnapshot llamado sin array válido");
    return;
  }

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

export async function getAlarmsSnapshot(): Promise<{
  savedAt: number;
  data: any[];
} | null> {
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

export async function clearAlarmsSnapshot() {
  await AsyncStorage.removeItem(ALARMS_KEY);
}

// ===========================
// LIMPIAR SESIÓN COMPLETA
// ===========================
export async function clearSession() {
  try {
    const userId = await getSavedUserId();

    const keysToRemove: string[] = [TOKEN_KEY, USER_ID_KEY, ALARMS_KEY];

    if (userId) {
      keysToRemove.push(groupsKeyForUser(userId));
    }

    await AsyncStorage.multiRemove(keysToRemove);
  } catch (e) {
    console.warn("[clearSession] Error limpiando sesión", e);
  }
}

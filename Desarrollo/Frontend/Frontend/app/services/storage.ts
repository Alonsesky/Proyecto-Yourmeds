import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiGroupsResponse } from "../types/groups";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";
const KEY_GROUPS_SNAPSHOT = "groups_snapshot_v1";


// METODOS DE TOKEN
export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// METODOS DE USER_ID
export async function saveUserId(id: string) {
  await AsyncStorage.setItem(USER_ID_KEY, id); 
}

export async function getSavedUserId() {
  return AsyncStorage.getItem(USER_ID_KEY);    
}

export async function removeUserId() {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

// METODOS PARA GROUPS - ALARMS
export async function saveGroupsSnapshot(payload: ApiGroupsResponse) {
  const wrapped = { savedAt: Date.now(), data: payload };
  await AsyncStorage.setItem(KEY_GROUPS_SNAPSHOT, JSON.stringify(wrapped));
}

export async function getGroupsSnapshot(): Promise<{
  savedAt: number; data: ApiGroupsResponse;
} | null> {
  const raw = await AsyncStorage.getItem(KEY_GROUPS_SNAPSHOT);
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
  await AsyncStorage.removeItem(KEY_GROUPS_SNAPSHOT);
}

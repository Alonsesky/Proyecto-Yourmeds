import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

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


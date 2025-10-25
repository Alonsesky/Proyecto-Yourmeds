import { Platform } from "react-native";
import { getToken } from "./storage";

const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8080" :
  Platform.OS === "ios"     ? "http://localhost:8080" : "http://192.168.0.117:8080";

type Options = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

function isAuthPath(path: string) {
  const pathname = path.startsWith("http") ? new URL(path).pathname : path;
  return pathname.startsWith("/api/v1/auth/");
}

export async function http(path: string, options: Options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const stored = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // No se enbia Autorization a enlaces: /api/v1/auth/**
  if (stored && !isAuthPath(path)) {
    // Si el token ya viene con "Bearer ", se utiliza o en caso contrario se agrega Bearer al token
    const hasBearer = /^Bearer\s+/i.test(stored);
    headers.Authorization = hasBearer ? stored : `Bearer ${stored}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
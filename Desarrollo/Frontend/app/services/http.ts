import { NativeModules, Platform } from "react-native";
import { getToken } from "./storage";

// ---------------------------------------------
// Configuración base
// ---------------------------------------------
const PORT = 8080;

// Rellenar IP AZURE.
// Si lo dejas vacío → usa autodescubrimiento normal.
const FIXED_HOST = ""; // <-- MODIFICA AQUÍ CUANDO QUIERAS

// (Opcional) ENV para producción en EAS
const ENV_BASE = (process.env.EXPO_PUBLIC_API_BASE || "").trim();

// ---------------------------------------------
// Descubrimiento automático de la IP
// ---------------------------------------------
function getAutoBase(): string {
  // 0) Prioridad máxima: IP fija del usuario
  if (FIXED_HOST.trim()) {
    return buildBase(FIXED_HOST.trim());
  }

  // 1) ENV_BASE (ideal en producción)
  if (ENV_BASE) return ENV_BASE;

  // 2) Intentar obtener desde scriptURL (Expo / RN)
  try {
    const url: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (url) {
      const u = new URL(url);
      const host = normalizeHost(u.hostname);
      return buildBase(host);
    }
  } catch {}

  // 3) Web (si llegas a usarlo)
  try {
    // @ts-ignore
    const host = typeof window !== "undefined" ? window.location?.hostname : "";
    if (host) return buildBase(normalizeHost(host));
  } catch {}

  // 4) Fallback estándar
  const fallbackHost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";
  return buildBase(fallbackHost);
}

function normalizeHost(host: string) {
  // Android emulador especial
  if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
    return "10.0.2.2";
  }
  return host || (Platform.OS === "ios" ? "localhost" : "10.0.2.2");
}

function buildBase(host: string) {
  return `http://${host}:${PORT}`;
}

// Base dinámica final
const API_URL = getAutoBase();

// ---------------------------------------------
// HTTP Wrapper (tu implementación original)
// ---------------------------------------------
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

  // No enviar Authorization en llamadas a /auth/**
  if (stored && !isAuthPath(path)) {
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

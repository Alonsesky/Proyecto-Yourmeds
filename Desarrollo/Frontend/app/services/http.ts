import { NativeModules, Platform } from "react-native";
import { getToken } from "./storage";

// --- Ajusta si usas otro puerto ---
const PORT = 8080;

// (opcional) usa EXPO_PUBLIC_API_BASE si lo defines en EAS (sincronico)
const ENV_BASE = (process.env.EXPO_PUBLIC_API_BASE || "").trim();

// Detecta host una sola vez (sincrónico y muy rápido)
function getAutoBase(): string {
  // 1) Si viene por ENV, úsalo tal cual (puede traer http(s) y puerto)
  if (ENV_BASE) return ENV_BASE;

  // 2) Intenta desde la URL del bundle (funciona en RN, Expo Dev Client)
  try {
    const url: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
    if (url) {
      const u = new URL(url);
      const host = normalizeHost(u.hostname);
      return buildBase(host);
    }
  } catch {}

  // 3) RN web (si alguna vez corres en web)
  try {
    // @ts-ignore
    const host = typeof window !== "undefined" ? window.location?.hostname : "";
    if (host) return buildBase(normalizeHost(host));
  } catch {}

  // 4) Fallbacks sensatos por plataforma
  const fallbackHost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";
  return buildBase(fallbackHost);
}

function normalizeHost(host: string) {
  // En emulador Android, "localhost" debe ser 10.0.2.2 para hablar con tu PC
  if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
    return "10.0.2.2";
  }
  return host || (Platform.OS === "ios" ? "localhost" : "10.0.2.2");
}

function buildBase(host: string) {
  // Si ENV_BASE no se usó, construimos http://host:PORT
  // (si necesitas https en prod, define EXPO_PUBLIC_API_BASE)
  return `http://${host}:${PORT}`;
}

// ===== aquí queda tu base dinámica =====
const API_URL = getAutoBase();

// ==================== tu código original sigue igual ====================
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

  // No se envía Authorization a /api/v1/auth/**
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

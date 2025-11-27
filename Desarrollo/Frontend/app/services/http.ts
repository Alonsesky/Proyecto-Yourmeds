import { NativeModules, Platform } from "react-native";
import { getToken } from "./storage";

// ---------------------------------------------
// Configuración base
// ---------------------------------------------
const PORT = 8080;

// En release pon aquí tu backend real (LAN o Azure)
// EJEMPLOS:
// const FIXED_HOST = "192.168.0.15";
// const FIXED_HOST = "20.xxx.xxx.xxx:8080";
// const FIXED_HOST = "https://mi-backend-yourmeds.azurewebsites.net";
const FIXED_HOST = "192.168.18.15";

const ENV_BASE = (process.env.EXPO_PUBLIC_API_BASE || "").trim();

// ---------------------------------------------
// Helpers
// ---------------------------------------------
function normalizeHost(host: string) {
  // Android emulador especial
  if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
    return "10.0.2.2";
  }
  return host || (Platform.OS === "ios" ? "localhost" : "10.0.2.2");
}

function buildBase(hostOrUrl: string) {
  const trimmed = hostOrUrl.trim();

  // Si ya viene con http/https, lo usamos tal cual
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, ""); // sin barra al final
  }

  // Si viene en formato host:puerto, respetamos ese puerto
  if (trimmed.includes(":")) {
    return `http://${trimmed}`;
  }

  // Si es solo host, usamos PORT
  return `http://${trimmed}:${PORT}`;
}

// ---------------------------------------------
// Descubrimiento automático de la IP
// ---------------------------------------------
function getAutoBase(): string {
  // 0) Si definiste FIXED_HOST, úsalo SIEMPRE (debug y release)
  if (FIXED_HOST.trim()) {
    return buildBase(FIXED_HOST);
  }

  // 1) ENV_BASE (ideal para producción tipo EAS)
  if (ENV_BASE) return buildBase(ENV_BASE);

  // 2) Solo usar scriptURL en modo desarrollo
  if (__DEV__) {
    try {
      const url: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
      if (url) {
        const u = new URL(url);
        const host = normalizeHost(u.hostname);
        return buildBase(host);
      }
    } catch {
      // ignorar
    }
  }

  // 3) Web (si algún día lo usas)
  try {
    // @ts-ignore
    const host = typeof window !== "undefined" ? window.location?.hostname : "";
    if (host) return buildBase(normalizeHost(host));
  } catch {
    // ignorar
  }

  // 4) Fallback (pensado solo para desarrollo, emulador, etc.)
  const fallbackHost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";
  return buildBase(fallbackHost);
}

// Base dinámica final
const API_URL = getAutoBase();

// ---------------------------------------------
// HTTP Wrapper
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

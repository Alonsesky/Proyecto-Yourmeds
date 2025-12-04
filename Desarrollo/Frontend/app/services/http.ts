import { NativeModules, Platform } from "react-native";
import { getToken } from "./storage";

/* ---------------------------------------------
 * Configuración base
 * --------------------------------------------- */
const PORT = 8080;

// En release pon aquí tu IP fija o dominio del backend
const FIXED_HOST = "74.163.240.144";

// Si usas variables EXPO_PUBLIC_API_BASE, se toma aquí
const ENV_BASE = (process.env.EXPO_PUBLIC_API_BASE || "").trim();

/* ---------------------------------------------
 * Helpers
 * --------------------------------------------- */
function normalizeHost(host: string) {
  // Android emulador especial
  if ((host === "localhost" || host === "127.0.0.1") && Platform.OS === "android") {
    return "10.0.2.2";
  }
  return host || (Platform.OS === "ios" ? "localhost" : "10.0.2.2");
}

function buildBase(hostOrUrl: string) {
  const trimmed = hostOrUrl.trim();

  // 1) Si ya viene con http/https → se usa tal cual
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, ""); // sin barra al final
  }

  // 2) Si viene en formato host:puerto → respetamos ese puerto
  if (trimmed.includes(":")) {
    return `http://${trimmed}`;
  }

  // 3) Si es solo host, agregamos el PORT
  return `http://${trimmed}:${PORT}`;
}

/* ---------------------------------------------
 * Descubrimiento automático de la IP
 * --------------------------------------------- */
function getAutoBase(): string {
  // 0) Si definiste FIXED_HOST → úsalo SIEMPRE (release)
  if (FIXED_HOST.trim()) {
    return buildBase(FIXED_HOST);
  }

  // 1) Si viene por ENV_BASE (EAS Production)
  if (ENV_BASE) return buildBase(ENV_BASE);

  // 2) Bundle script URL en modo desarrollo
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

  // 4) Fallback en dev/emulador
  const fallbackHost = Platform.OS === "ios" ? "localhost" : "10.0.2.2";
  return buildBase(fallbackHost);
}

/* ---------------------------------------------
 * Base dinámica final
 * --------------------------------------------- */
const API_URL = getAutoBase();

// Log para debugging en Release
console.log("[http] API_URL =", API_URL);

/* ---------------------------------------------
 * HTTP Wrapper
 * --------------------------------------------- */
type Options = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

function isAuthPath(path: string) {
  const pathname = path.startsWith("http") ? new URL(path).pathname : path;
  return pathname.startsWith("/api/v1/auth/");
}

/* --------- Error HTTP tipado --------- */
export class HttpError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/* ---------------------------------------------
 * Función http principal
 * --------------------------------------------- */
export async function http(path: string, options: Options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const storedToken = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Agregar Authorization automáticamente SI hay token y NO es ruta /auth/**
  if (storedToken && !isAuthPath(path)) {
    const alreadyHasBearer = /^Bearer\s+/i.test(storedToken);
    headers.Authorization = alreadyHasBearer ? storedToken : `Bearer ${storedToken}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  /* --------- Manejo de errores HTTP --------- */
  if (!res.ok) {
    let errorBody: any = null;

    if (isJson) {
      errorBody = await res.json().catch(() => null);
    } else {
      errorBody = await res.text().catch(() => "");
    }

    const backendMsg =
      errorBody && typeof errorBody === "object" && "message" in errorBody
        ? String((errorBody as any).message)
        : "";

    const msg = backendMsg || `HTTP ${res.status}`;
    throw new HttpError(res.status, msg, errorBody);
  }

  /* --------- Respuesta exitosa --------- */
  if (isJson) {
    return res.json();
  }

  return res.text();
}

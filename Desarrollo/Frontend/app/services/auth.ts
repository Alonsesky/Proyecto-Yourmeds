import { Platform } from 'react-native';

/** Respuesta que devuelve el backend tanto en register como en login */
export type Me = {
  id: number;
  email: string;
  fullName: string;
};

const DEV_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'     // Android Emulator
    : 'http://localhost:8080';   // iOS Simulator / Web
// Si usas dispositivo físico: pon la IP LAN de tu PC, ej:
// const DEV_BASE_URL = 'http://192.168.1.23:8080';

/** pequeño wrapper que tipa la respuesta y propaga el status en los errores */
async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${DEV_BASE_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    // @ts-ignore
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    // @ts-ignore — para endpoints 201 sin body
    return null;
  }
  return res.json() as Promise<T>;
}

export const AuthApi = {
  /** POST /api/auth/register */
  register: (fullName: string, email: string, password: string) =>
    request<Me>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    }),

  /** POST /api/auth/login */
  login: (email: string, password: string) =>
    request<Me>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
};

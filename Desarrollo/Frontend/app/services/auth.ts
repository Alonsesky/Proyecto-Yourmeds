// app/services/auth.ts (o la ruta que uses)
import { http } from "./http";
import { clearSession } from "./storage";

/* === ENDPOINTS === */
const LOGIN_PATH = "/api/v1/auth/login";
const REGISTER_PATH = "/api/v1/auth/register";

/* === TIPOS DE RESPUESTA === */
export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string; // "Bearer eyJhbGciOiJIUzUxMiJ9..."
  user: {
    id: number;
    email: string;
    rut: string;
    name: string;
    lastName: string;
    age: number;
    roles: {
      id: string;
      name: string;
      route: string;
    }[];
    notification_token: string | null;
  };
};

/* === LOGIN === */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Opcional pero útil: limpiar restos de sesión antes de un login nuevo
  await clearSession();

  const data = await http(LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // El backend devuelve exactamente:
  // {
  //   "token": "Bearer eyJh...",
  //   "user": { ... }
  // }
  return data as LoginResponse;
}

/* === REGISTER === */
export type RegisterBody = {
  email: string;
  password: string;
  name: string;
  lastName: string;
  rut: string;
  age: number;
};

export async function register(payload: RegisterBody) {
  const data = await http(REGISTER_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

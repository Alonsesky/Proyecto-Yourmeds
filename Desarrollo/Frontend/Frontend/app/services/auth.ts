import { http } from "./http";
import { saveToken } from "./storage";

// CONSTANTES QUE SE UTILIZA EN LOS DIFERENTES METODOS
const LOGIN_PATH = "/api/v1/auth/login";

// METODO PARA LOGUEAR A UN USUARIO
export async function login(payload: { email: string; password: string }) {
  const data = await http(LOGIN_PATH, { method: "POST", body: JSON.stringify(payload) });

  // Guarda el token tal cual venga: "Bearer <jwt>" o "<jwt>"
  const token =
    (data as any).token ??
    (data as any).access_token ??
    (data as any).jwt;

  if (!token) throw new Error("No se recibió token.");

  await saveToken(String(token).trim());
  return String(token).trim();
}

// METODO PARA REGISTRAR AL USUARIO
export async function register(payload: { email: string; password: string }) {
  const data = await http(LOGIN_PATH, { method: "POST", body: JSON.stringify(payload) });

  // Guarda el token tal cual venga: "Bearer <jwt>" o "<jwt>"
  const token =
    (data as any).token ??
    (data as any).access_token ??
    (data as any).jwt;

  if (!token) throw new Error("No se recibió token.");

  await saveToken(String(token).trim());
  return String(token).trim();
}
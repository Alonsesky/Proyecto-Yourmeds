import { http } from "./http";
import { saveToken } from "./storage";

/* === ENDPOINTS === */
const LOGIN_PATH = "/api/v1/auth/login";
const REGISTER_PATH = "/api/v1/auth/register";

/* === LOGIN === */
export async function login(payload: { email: string; password: string }) {
  const data = await http(LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token =
    (data as any).token ??
    (data as any).access_token ??
    (data as any).jwt;

  if (!token) throw new Error("No se recibió token.");

  await saveToken(String(token).trim());
  return data; 
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

import { http } from "./http";

// METODO PARA SABER EL USER_ID
export async function fetchMyId(): Promise<string> {
  
  const data = await http("/api/v1/user/me/id");
  if (typeof data !== "number") {
    throw new Error((data as any)?.message ?? "No se pudo obtener el ID");
  }
  return String(data);
}


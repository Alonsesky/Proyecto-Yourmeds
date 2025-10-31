import type { ApiGroupsResponse, GroupCreateRequest, GroupResponse } from "../types/groupTypes";
import { http } from "./http";

// VARIABLES A UTILIZAR
const GROUPS_WITH_ALARMS_PATH = "/api/v1/user/1/overview"; 
const GROUPS_PATH = "/api/v1/group";

// METODO PARA MANEJAR LOS DATOS DE UN USUARIO
export async function fetchMyGroupsAndAlarms(): Promise<ApiGroupsResponse> {
  const data = await http(GROUPS_WITH_ALARMS_PATH);
  // Validación mínima defensiva:
  if (!data || typeof data !== "object" || !Array.isArray((data as any).groups)) {
    return { userId: 0, name: "", groups: [] };
  }
  return data as ApiGroupsResponse;
  }


// METODO PARA CREAR UN GRUPO
export async function createGroup(payload: GroupCreateRequest): Promise<GroupResponse> {
  const name = String(payload.name ?? "").trim();
  const color = String(payload.color ?? "").trim();

  if (!name) throw new Error("El nombre es obligatorio.");
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error("Color inválido. Usa formato HEX #RRGGBB.");
  }

  const data = await http(GROUPS_PATH, {
    method: "POST",
    body: JSON.stringify({ name, color, is_private: !!payload.is_private }),
  });

  return data as GroupResponse;
}
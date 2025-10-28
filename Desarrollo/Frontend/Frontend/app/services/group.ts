import type { ApiGroupsResponse } from "../types/groups";
import { http } from "./http";

// METODO PARA MANEJAR LOS DATOS
    const GROUPS_WITH_ALARMS_PATH = "/api/v1/user/1/overview"; 

    export async function fetchMyGroupsAndAlarms(): Promise<ApiGroupsResponse> {
    const data = await http(GROUPS_WITH_ALARMS_PATH);
    // Validación mínima defensiva:
    if (!data || typeof data !== "object" || !Array.isArray((data as any).groups)) {
      return { userId: 0, name: "", groups: [] };
    }
    return data as ApiGroupsResponse;
  }
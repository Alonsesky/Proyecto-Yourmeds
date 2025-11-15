import { ApiAlarm } from "../types/groupTypes";
import { http } from "./http";
import { getGroupsSnapshot } from "./storage";

// ===============================
// Tipos de datos
// ===============================
export type AlarmCreateRequest = {
  name: string;
  alarm_type: boolean;      // false=fijo, true=variado
  active: boolean;
  cant: number;
  time_alarm: string;       // "HH:mm"
  date_start: string;       // "YYYY-MM-DD"
  group_id: number;
  // Solo en variado:
  date_end?: string;        // requerido si alarm_type=true
  interval_hours?: number;  // requerido si alarm_type=true
  description?: string | null;
};

export type AlarmResponse = {
  id: number;
  name: string;
  alarm_type: boolean;
  active: boolean;
  cant: number;
  time_alarm: string;       // "HH:mm:ss"
  date_start: string;
  date_end: string | null; 
  description: string | null;
  timestamp: string;
  group_id: number;
  interval_hours?: number | null;
};

type GroupsSnapshot = {
  groups?: {
    id?: number;
    groupId?: number;
    alarms?: ApiAlarm[];
  }[];
};

// ===============================
const ALARMS_PATH = "/api/v1/alarm";

// ===============================
export async function createAlarm(payload: AlarmCreateRequest): Promise<AlarmResponse> {
  const {
    name,
    alarm_type,
    active,
    cant,
    time_alarm,
    date_start,
    group_id,
    date_end,
    interval_hours,
    description,
  } = payload;

  // Validaciones comunes
  if (!name?.trim()) throw new Error("El nombre es obligatorio.");
  if (!time_alarm) throw new Error("Debes seleccionar una hora.");
  if (!date_start) throw new Error("Debes indicar fecha de inicio.");
  if (!group_id) throw new Error("Falta el ID del grupo.");

  // Construir objeto base
  const bodyObj: any = {
    name: name.trim(),
    alarm_type,
    active: !!active,
    cant: Number(cant) || 1,           // ← robusto si viene como string
    time_alarm,
    date_start,
    group_id: Number(group_id),
  };
  if (description != null) bodyObj.description = description;

  if (alarm_type === true) {
    // VARIADO: requiere date_end + interval_hours
    if (!date_end) throw new Error("En 'variado' debes indicar fecha de término.");
    const ih = Number(interval_hours);
    if (!Number.isFinite(ih) || ih < 1 || ih > 24) {
      throw new Error("interval_hours debe estar entre 1 y 24.");
    }
    bodyObj.date_end = date_end;
    bodyObj.interval_hours = ih;
  }
  // FIJO: no enviamos date_end/interval_hours; el backend normaliza

  const data = await http(ALARMS_PATH, {
    method: "POST",
    body: JSON.stringify(bodyObj),
  });

  return data as AlarmResponse;
}

// (Opcionales)
export async function fetchAllAlarms(): Promise<AlarmResponse[]> {
  const data = await http(ALARMS_PATH);
  return data as AlarmResponse[];
}

export async function deleteAlarm(id: number): Promise<void> {
  await http(`${ALARMS_PATH}/${id}`, { method: "DELETE" });
}

export async function updateAlarm(id: number|string, body: any) {
  return http(`${ALARMS_PATH}/${id}`, { method:'PUT', body: JSON.stringify(body) });
}

type GroupsSnapshotLoose =
  | { data?: { groups?: any[] } }   // caso snapshot envuelto en { data }
  | { groups?: any[] }              // caso snapshot directo
  | null
  | undefined;

// Normaliza "HH:mm[:ss]" a "HH:mm:ss"
function normTime(hhmm: string) {
  if (!hhmm) return "00:00:00";
  const parts = hhmm.split(":");
  if (parts.length === 2) return `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}:00`;
  if (parts.length >= 3)  return `${parts[0].padStart(2,"0")}:${parts[1].padStart(2,"0")}:${parts[2].padStart(2,"0")}`;
  return "00:00:00";
}

/**
 * Lee alarmas desde el snapshot de grupos en storage.
 * Si no hay snapshot (o está vacío), cae a la API /api/v1/alarm (fetchAllAlarms).
 */
export async function getAlarmsFromStorageOrApi(): Promise<AlarmResponse[]> {
  try {
    const snap = (await getGroupsSnapshot()) as GroupsSnapshotLoose;

    // 🔧 Tolerar ambas formas: { data: { groups: [...] } } o { groups: [...] }
    const container: any = snap && 'data' in (snap as any) ? (snap as any).data : snap;
    const groups = Array.isArray(container?.groups) ? container.groups : [];

    // Aplana alarmas de todos los grupos y normaliza campos a AlarmResponse
    const fromStorage: AlarmResponse[] = groups.flatMap((g: any) => {
      const alarms = Array.isArray(g?.alarms) ? g.alarms : [];
      return alarms.map((a: any) => {
        const cantNum = Number(a?.cant);
        const ihNum = a?.interval_hours != null ? Number(a.interval_hours) : null;

        return {
          id: Number(a?.id),
          name: String(a?.name ?? ""),
          alarm_type: !!a?.alarm_type,                 // false=fijo, true=variado
          active: !!a?.active,
          cant: Number.isFinite(cantNum) ? cantNum : 1,
          time_alarm: normTime(String(a?.time_alarm ?? "00:00")),
          date_start: String(a?.date_start ?? ""),
          date_end: a?.date_end != null ? String(a.date_end) : null,
          description: a?.description ?? null,
          timestamp: String(a?.timestamp ?? ""),
          group_id: Number(g?.groupId ?? g?.id ?? a?.group_id ?? 0),
          interval_hours: Number.isFinite(ihNum as number) ? (ihNum as number) : null,
        } as AlarmResponse;
      });
    });

    if (fromStorage.length) {
      console.log('[alarms] desde storage:', fromStorage.length);
      return fromStorage;
    }
  } catch (e) {
    console.warn('[alarms] fallo leyendo snapshot, usando API:', e);
  }

  // Fallback: API directa
  const api = await fetchAllAlarms();
  console.log('[alarms] desde API:', api.length);
  return api;
}
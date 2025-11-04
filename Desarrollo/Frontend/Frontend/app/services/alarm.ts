import { http } from "./http";

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
  date_end: string;
  description: string | null;
  timestamp: string;
  group_id: number;
  interval_hours?: number | null;
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
    cant: Number.isFinite(cant) ? Number(cant) : 1,
    time_alarm,
    date_start,
    group_id: Number(group_id),
  };
  if (description != null) bodyObj.description = description;

  if (alarm_type === true) {
    // VARIADO: requiere date_end + interval_hours
    if (!date_end) throw new Error("En 'variado' debes indicar fecha de término.");
    if (interval_hours == null || Number(interval_hours) < 1 || Number(interval_hours) > 24) {
      throw new Error("interval_hours debe estar entre 1 y 24.");
    }
    bodyObj.date_end = date_end;
    bodyObj.interval_hours = Number(interval_hours);
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

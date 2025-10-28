// INTERFACES DE DISTINTAS ENTIDADES QUE SE MANEJARAN CON LOS ENDPOINTS

// app/types/groups.ts

export interface ApiAlarm {
  id: number;
  name: string;
  alarm_type: boolean;     // Tipo de horario
  active: boolean;         // alarma habilitada
  cant: number;            // cantidad / dosis
  time_alarm: string;      // "HH:mm:ss"
  date_start: string;      // "YYYY-MM-DD"
  date_end: string;        // "YYYY-MM-DD"
  description: string;
}

export interface ApiGroupUser {
  id: number;
  name: string;
  isOwner: boolean;
}

export interface ApiGroup {
  groupId: number;
  name: string;
  users: ApiGroupUser[];
  alarms: ApiAlarm[];
  private: boolean;
  owner: boolean;
}

export interface ApiGroupsResponse {
  userId: number;
  name: string; // nombre del usuario autenticado
  groups: ApiGroup[];
}

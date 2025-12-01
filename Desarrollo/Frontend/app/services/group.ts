import type {
  ApiGroupsResponse,
  GroupCreateRequest,
  GroupResponse,
} from '../types/groupTypes';
import { http } from './http';
import { getSavedUserId } from './storage';

// ===============================
// ENDPOINTS BASE
// ===============================
const GROUPS_PATH = '/api/v1/group';

// ===============================
// MÉTODO: Datos del usuario logueado
// ===============================
export async function fetchMyGroupsAndAlarms(): Promise<ApiGroupsResponse> {
  const userId = await getSavedUserId();
  if (!userId) {
    console.warn(
      'No se encontró userId en storage, devolviendo datos vacíos.'
    );
    return { userId: 0, name: '', groups: [] };
  }

  const url = `/api/v1/user/${userId}/overview`;
  const data = await http(url);

  if (!data || typeof data !== 'object' || !Array.isArray((data as any).groups)) {
    console.warn(
      'Respuesta inesperada del servidor en fetchMyGroupsAndAlarms'
    );
    return { userId, name: '', groups: [] };
  }

  return data as ApiGroupsResponse;
}

// ===============================
// MÉTODO: Crear grupo
// ===============================
export async function createGroup(
  payload: GroupCreateRequest
): Promise<GroupResponse> {
  const name = String(payload.name ?? '').trim();
  const color = String(payload.color ?? '').trim();

  if (!name) throw new Error('El nombre es obligatorio.');
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error('Color inválido. Usa formato HEX #RRGGBB.');
  }

  const data = await http(GROUPS_PATH, {
    method: 'POST',
    body: JSON.stringify({ name, color, is_private: !!payload.is_private }),
  });

  return data as GroupResponse;
}

// ===============================
// MÉTODO: Obtener grupo por id
// ===============================
export async function getGroupById(
  id: number | string
): Promise<GroupResponse> {
  const data = await http(`${GROUPS_PATH}/${id}`, { method: 'GET' });
  return data as GroupResponse;
}

// ===============================
// MÉTODO: Actualizar grupo
// ===============================
export async function updateGroup(
  id: number | string,
  payload: GroupCreateRequest
): Promise<GroupResponse> {
  const name = String(payload.name ?? '').trim();
  const color = String(payload.color ?? '').trim();

  if (!name) throw new Error('El nombre es obligatorio.');
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error('Color inválido. Usa formato HEX #RRGGBB.');
  }

  const data = await http(`${GROUPS_PATH}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name,
      color,
      is_private: !!payload.is_private,
    }),
  });

  return data as GroupResponse;
}

// ===============================
// MÉTODOS: Miembros del grupo
// ===============================
export async function addMembersToGroup(
  groupId: number | string,
  emails: string[]
) {
  return http(`/api/v1/group/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userEmails: emails }),
  });
}

// Tipo que viene del backend
export type MemberDto = {
  id: number;
  name: string;
  last_name: string;
  isOwner: boolean;
  email?: string;
};

export async function listMembers(
  groupId: number | string
): Promise<MemberDto[]> {
  return http(`/api/v1/group/${groupId}/members`, { method: 'GET' });
}

// Elimina el grupo completo (solo para propietario)
export async function deleteGroup(groupId: number | string) {
  return http(`/api/v1/group/${groupId}`, { method: 'DELETE' });
}

// Para salirse de un grupo compartido (no propietario)
export async function leaveGroup(
  groupId: number | string,
  userId: number
) {
  return http(`/api/v1/group/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });
}

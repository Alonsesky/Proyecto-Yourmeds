// services/user.ts
import { http } from './http';

// Tipo de perfil que usaremos en Home y ProfileUser
export type MeProfile = {
  id: number | string;
  name: string;
  last_name: string;
  email: string;
  rut?: string;
  age?: number;
};

// =========================
// 1) Obtener SOLO el ID
// =========================
export async function fetchMyId(): Promise<string> {
  const data = await http('/api/v1/user/me/id');

  // Tu endpoint devuelve un Long (número). Validamos eso.
  if (typeof data !== 'number') {
    throw new Error((data as any)?.message ?? 'No se pudo obtener el ID');
  }
  return String(data);
}

// =========================
// 2) Obtener PERFIL COMPLETO
// =========================
// Usa /api/v1/user/{id} con el ID actual
export async function fetchMyProfile(): Promise<MeProfile | null> {
  // 1) obtenemos el id del usuario autenticado
  const id = await fetchMyId();

  // 2) llamamos al endpoint GET /api/v1/user/{id}
  const data = await http(`/api/v1/user/${id}`);

  if (!data || typeof data !== 'object') {
    return null;
  }

  const anyData = data as any;

  return {
    id: anyData.id ?? id,
    name:
      anyData.name ??
      '',
    last_name:
      anyData.last_name ??
      '',
    email:
      anyData.email ??
      '',
    rut: anyData.rut ??  undefined,
    age: anyData.age ??  undefined,
  };
}

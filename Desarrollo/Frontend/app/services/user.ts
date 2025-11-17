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

  if (typeof data !== 'number') {
    throw new Error((data as any)?.message ?? 'No se pudo obtener el ID');
  }
  return String(data);
}

// =========================
// 2) Obtener PERFIL COMPLETO
// =========================
export async function fetchMyProfile(): Promise<MeProfile | null> {
  const id = await fetchMyId();
  const data = await http(`/api/v1/user/${id}`);

  if (!data || typeof data !== 'object') {
    return null;
  }

  const anyData = data as any;

  // Nombre: soporta varias claves
  const rawName =
    anyData.name ??
    anyData.firstName ??
    anyData.firstname ??
    '';

  // Apellido: aquí añadimos todas las variantes posibles
  const rawLast =
    anyData.last_name ??
    anyData.lastName ??
    anyData.lastname ??
    anyData.apellido ??
    anyData.apellidos ??
    '';

  const rawEmail =
    anyData.email ??
    anyData.mail ??
    anyData.username ??
    '';

  const rawRut = anyData.rut ?? anyData.dni ?? undefined;
  const rawAge = anyData.age ?? anyData.edad ?? undefined;

  return {
    id: anyData.id ?? id,
    name: String(rawName).trim(),
    last_name: String(rawLast).trim(),
    email: String(rawEmail).trim(),
    rut: rawRut,
    age: rawAge,
  };
}

export async function updateMyProfile(payload: {
  name: string;
  last_name: string;
  rut: string | null;
  age: number | null;
  email: string;
}): Promise<MeProfile> {
  // OJO: ya NO llamamos a fetchMyId, el backend saca el id del token
  const id = await fetchMyId();   // <--- aquí defines id

  const data = await http(`/api/v1/user/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const anyData = data as any;

  const rawName =
    anyData.name ??
    anyData.firstName ??
    anyData.firstname ??
    payload.name;

  const rawLast =
    anyData.last_name ??
    anyData.lastName ??
    anyData.lastname ??
    anyData.apellido ??
    anyData.apellidos ??
    payload.last_name;

  const rawEmail =
    anyData.email ??
    anyData.mail ??
    anyData.username ??
    payload.email;

  const rawRut = anyData.rut ?? anyData.dni ?? payload.rut ?? undefined;
  const rawAge = anyData.age ?? anyData.edad ?? payload.age ?? undefined;

  return {
    id: anyData.id ?? 'me',
    name: String(rawName).trim(),
    last_name: String(rawLast).trim(),
    email: String(rawEmail).trim(),
    rut: rawRut,
    age: rawAge,
  };
}


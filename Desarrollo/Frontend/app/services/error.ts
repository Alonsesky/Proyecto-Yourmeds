// services/error.ts
type ParseOpts = {
  context?: 'auth' | 'default';   // ← NUEVO: sólo "auth" fuerza el mensaje 401
  fallback?: string;              // opcional: mensaje por defecto si no hay mensaje útil
};

export function parseApiError(e: any, opts: ParseOpts = {}): { msg: string; details?: string } {
  const { context = 'default', fallback } = opts;

  const status = e?.status || e?.statusCode || e?.response?.status;
  const bodyMsg =
    e?.message ||
    e?.response?.data?.message ||
    e?.data?.message ||
    (typeof e?.response?.data === 'string' ? e.response.data : undefined) ||
    e?.toString?.();

  let msg =
    (typeof bodyMsg === 'string' && bodyMsg.trim().length > 0)
      ? bodyMsg
      : (fallback || 'Ocurrió un error inesperado. Inténtalo nuevamente.');

  // stringify del payload crudo para debugging opcional
  let details: string | undefined;
  try {
    const raw = e?.response?.data ?? e?.data ?? e;
    details = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
  } catch {
    details = undefined;
  }

  // ← Sólo en contexto de autenticación “traducimos” el 401 a un mensaje fijo
  if (context === 'auth' && status === 401) {
    msg = 'El email o la contraseña no son válidos.';
  }

  return { msg, details };
}

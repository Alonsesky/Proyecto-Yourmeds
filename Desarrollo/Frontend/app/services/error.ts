// services/error.ts
import { HttpError } from './http';

type ParseOpts = {
  context?: 'auth' | 'default';
  fallback?: string;
};

export function parseApiError(
  e: any,
  opts: ParseOpts = {}
): { msg: string; details?: string } {
  const { context = 'default', fallback } = opts;

  // 1) Status
  let status: number | undefined;
  if (e instanceof HttpError) {
    status = e.status;
  } else {
    status = e?.status || e?.statusCode || e?.response?.status;
  }

  // 2) Mensaje principal
  let backendMsg: string | undefined;

  if (e instanceof HttpError) {
    const body = e.body;
    if (body && typeof body === 'object' && 'message' in body) {
      backendMsg = String((body as any).message);
    }
  }

  const bodyMsg =
    backendMsg ||
    e?.message ||
    e?.response?.data?.message ||
    e?.data?.message ||
    (typeof e?.response?.data === 'string' ? e.response.data : undefined) ||
    e?.toString?.();

  let msg =
    typeof bodyMsg === 'string' && bodyMsg.trim().length > 0
      ? bodyMsg
      : fallback || 'Ocurrió un error inesperado. Inténtalo nuevamente.';

  // 3) Detalle (solo si NO es auth, para no mostrar {} en login)
  let details: string | undefined;
  if (context !== 'auth') {
    try {
      const raw = e instanceof HttpError ? e.body : e?.response?.data ?? e?.data ?? e;
      details = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
    } catch {
      details = undefined;
    }
  }

  // 4) Traducción especial para login
  if (context === 'auth' && status === 401) {
    msg = 'El email o la contraseña no son válidos.';
  }

  return { msg, details };
}

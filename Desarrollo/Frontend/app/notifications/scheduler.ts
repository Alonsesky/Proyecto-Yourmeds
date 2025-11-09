import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AlarmResponse } from '../services/alarm';

// ==== Canal ====
export async function ensureAlarmChannel(): Promise<string> {
  return await notifee.createChannel({
    id: 'alarms',
    name: 'Alarmas',
    sound: 'default',
    importance: AndroidImportance.MAX,
    visibility: AndroidVisibility.PUBLIC,
    bypassDnd: true,
    vibration: true,
    lights: true,
  });
}

// ==== Helpers de tiempo ====
function parseHHmm(hhmm: string): { h: number; m: number } {
  const [hh, mm] = hhmm.split(':').map(n => parseInt(n, 10));
  return { h: hh || 0, m: mm || 0 };
}

function toDate(dateISO: string, timeHHmm?: string): Date {
  const d = new Date(dateISO + 'T00:00:00');
  if (timeHHmm) {
    const { h, m } = parseHHmm(timeHHmm);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

// ==== Persistencia del "siguiente disparo" para variado ====
const nextKey = (id: number) => `alarm_nextAt_${id}`;

export async function getNextAt(id: number): Promise<number | null> {
  const raw = await AsyncStorage.getItem(nextKey(id));
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
}

async function setNextAt(id: number, ts: number) {
  await AsyncStorage.setItem(nextKey(id), String(ts));
}

// ==== Cálculos de próxima ejecución ====
// Fijo = todos los días a HH:mm, comenzando en date_start
function computeNextForFixed(a: AlarmResponse): number | null {
  const now = new Date();
  const startDay = toDate(a.date_start);
  const { h, m } = parseHHmm(a.time_alarm);

  const candidate = new Date();
  candidate.setHours(h, m, 0, 0);

  // Si la fecha de inicio es futura, programa en el día de inicio a HH:mm
  if (candidate.getTime() < startDay.getTime()) {
    const first = toDate(a.date_start, a.time_alarm).getTime();
    return first > now.getTime() ? first : null;
  }

  // Si hoy ya pasó esa hora, programa para mañana
  if (candidate.getTime() <= now.getTime()) {
    const tomorrow = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
    return tomorrow.getTime();
  }
  return candidate.getTime();
}

// Variado = cada N horas entre date_start y date_end, empezando en time_alarm
function computeNextForVariable(a: AlarmResponse): number | null {
  const everyMs = (a.interval_hours ?? 0) * 60 * 60 * 1000;
  if (!everyMs) return null;

  const now = Date.now();
  const start = toDate(a.date_start, a.time_alarm).getTime();
  const end = a.date_end ? toDate(a.date_end, a.time_alarm).getTime() : null;

  // Toma el próximo múltiplo >= now
  let next = start;
  if (now > start) {
    const passed = now - start;
    const steps = Math.ceil(passed / everyMs);
    next = start + steps * everyMs;
  }
  if (end && next > end) return null;
  return next;
}

// ==== Programadores ====
// Fijo: repetición diaria
export async function scheduleFixed(a: AlarmResponse, channelId: string) {
  const nextTs = computeNextForFixed(a);
  if (!nextTs) return;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextTs,
    repeatFrequency: RepeatFrequency.DAILY, // 🔁 a diario
    alarm: true,
    allowWhileIdle: true,
  } as unknown as TimestampTrigger;

  await notifee.createTriggerNotification(
    {
      id: `alarm-fixed-${a.id}`,
      title: `⏰ ${a.name}`,
      body: 'Es hora de tu medicamento.',
      android: {
        channelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.MAX,
        visibility: AndroidVisibility.PUBLIC,
        loopSound: true,
        sound: 'default',
        pressAction: { id: 'default' },
        actions: [
          { title: 'Tomado', pressAction: { id: 'taken' } },
          { title: '+5 min', pressAction: { id: 'snooze_5' } },
        ],
      },
    },
    trigger
  );
}

// Variado: one-shot. El siguiente se encadena al entregarse (ver alarmService.notifee.ts)
export async function scheduleVariable(a: AlarmResponse, channelId: string) {
  const saved = await getNextAt(a.id);
  const nextTs = Number.isFinite(saved ?? NaN) ? (saved as number) : computeNextForVariable(a);
  if (!nextTs) return;

  await setNextAt(a.id, nextTs);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextTs,
    alarm: true,
    allowWhileIdle: true,
  } as unknown as TimestampTrigger;

  await notifee.createTriggerNotification(
    {
      id: `alarm-var-${a.id}`,
      title: `⏰ ${a.name}`,
      body: `Toma cada ${a.interval_hours}h.`,
      android: {
        channelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.MAX,
        visibility: AndroidVisibility.PUBLIC,
        loopSound: true,
        sound: 'default',
        pressAction: { id: 'default' },
        actions: [
          { title: 'Tomado', pressAction: { id: 'taken' } },
          { title: '+5 min', pressAction: { id: 'snooze_5' } },
        ],
      },
    },
    trigger
  );
}

// Encadenar el siguiente “variado” tras la entrega
export async function onVariableDelivered(a: AlarmResponse) {
  const everyMs = (a.interval_hours ?? 0) * 60 * 60 * 1000;
  if (!everyMs) return;
  const next = Date.now() + everyMs;
  await setNextAt(a.id, next);
}

// ==== Orquestador principal ====
export async function scheduleAll(alarms: AlarmResponse[]) {
  const channelId = await ensureAlarmChannel();

  // Quitar triggers anteriores de "nuestras" alarmas para evitar duplicados
  const existing = await notifee.getTriggerNotifications();
  const idsToRemove = (existing ?? [])
    .map(n => n.notification?.id)
    .filter(Boolean)
    .filter((id) => String(id).startsWith('alarm-fixed-') || String(id).startsWith('alarm-var-')) as string[];

  if (idsToRemove.length) {
    await notifee.cancelTriggerNotifications(idsToRemove);
  }

  for (const a of alarms) {
    if (!a.active) continue;
    if (a.alarm_type === false) {
      await scheduleFixed(a, channelId);
    } else {
      await scheduleVariable(a, channelId);
    }
  }
}

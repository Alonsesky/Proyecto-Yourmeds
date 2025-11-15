import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { getAlarmsFromStorageOrApi } from '../services/alarm';
import { ensureAlarmChannel, onVariableDelivered, scheduleAll } from './scheduler';

// ===== Permisos =====
export async function ensureNotificationPermission(): Promise<AuthorizationStatus> {
  try {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus;
  } catch {
    return AuthorizationStatus.DENIED;
  }
}

// ===== Utilidades =====
export async function cancelById(id?: string) {
  if (!id) return;
  try { await notifee.cancelNotification(id); } catch {}
  try { await notifee.cancelTriggerNotification(id); } catch {}
}

export async function stopAllAlarms() {
  try { await notifee.cancelDisplayedNotifications(); } catch {}
  try {
    const ts = await notifee.getTriggerNotifications();
    const ids = (ts ?? [])
      .map(t => t.notification?.id)
      .filter(Boolean) as string[];
    if (ids.length) await notifee.cancelTriggerNotifications(ids);
  } catch {}
}

// Reprogramar con “snooze”
export async function snoozeMinutes(baseId: string, minutes: number) {
  const when = new Date(Date.now() + minutes * 60 * 1000);
  await scheduleRealAlarm({
    id: `${baseId}-snooze-${minutes}`,
    title: '⏰ Recordatorio',
    body: `Te recordaremos en ${minutes} minutos.`,
    date: when,
  });
}

// ===== Programar una sola alarma directa (atajo) =====
export async function scheduleRealAlarm(opts: {
  id: string | number;
  title: string;
  body: string;
  date: Date;
}) {
  const channelId = await ensureAlarmChannel(); // <- ahora devuelve 'alarms_v2'

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: opts.date.getTime(),
    alarm: true,
    allowWhileIdle: true,
  } as unknown as TimestampTrigger;

  const payload = {
    id: String(opts.id),
    title: opts.title,
    body: opts.body,
    android: {
      channelId,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.MAX,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'default',
      loopSound: true,
      vibrationPattern: [500, 800, 1200, 800],
      pressAction: { id: 'default' },
      // fullScreenAction: { id: 'default' }, // opcional, si config nativa existe
      actions: [
        { title: 'Tomé mi medicamento', pressAction: { id: 'taken' } },
        { title: 'Snooze 5 min', pressAction: { id: 'snooze_5' } },
      ],
    },
  } as const;

  try {
    await notifee.createTriggerNotification(payload, trigger);
    console.log('[notifee] trigger programado:', payload.id, '->', trigger.timestamp);
  } catch (e) {
    console.warn('[notifee] fallo al programar trigger, enviando inmediata:', e);
    // Fallback inmediato para verificar que el motor de notificaciones está OK
    await notifee.displayNotification(payload as any);
  }
}

/**
 * Encadenar el siguiente “variado” tras la entrega (si aplica)
 */
async function handleAfterDeliver(notificationId?: string) {
  if (!notificationId) return;
  const m = String(notificationId).match(/^alarm-var-(\d+)$/);
  if (!m) return;

  const alarmId = Number(m[1]);
  const alarms = await getAlarmsFromStorageOrApi();
  const a = alarms.find(x => x.id === alarmId);
  if (!a) return;

  if (a.alarm_type === true) {
    await onVariableDelivered(a);
    const fresh = await getAlarmsFromStorageOrApi();
    await scheduleAll(fresh);
  }
}

// ===== Listeners =====
export function registerAlarmListeners() {
  const unsubFG = notifee.onForegroundEvent(async ({ type, detail }) => {
    const id = detail.notification?.id ?? '';

    switch (type) {
      case EventType.DELIVERED:
        await handleAfterDeliver(id);
        break;

      case EventType.ACTION_PRESS: {
        const action = detail.pressAction?.id;
        if (action === 'taken') {
          await cancelById(id);
        } else if (action === 'snooze_5') {
          await cancelById(id);
          await snoozeMinutes(id, 5);
        }
        break;
      }

      default:
        break;
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const id = detail.notification?.id ?? '';

    switch (type) {
      case EventType.DELIVERED:
        await handleAfterDeliver(id);
        break;

      case EventType.ACTION_PRESS: {
        const action = detail.pressAction?.id;
        if (action === 'taken') {
          await cancelById(id);
        } else if (action === 'snooze_5') {
          await cancelById(id);
          await snoozeMinutes(id, 5);
        }
        break;
      }

      default:
        break;
    }
  });

  return () => unsubFG();
}

export async function initNotificationsOnce() {
  await ensureNotificationPermission();
  await ensureAlarmChannel();
  registerAlarmListeners();
}

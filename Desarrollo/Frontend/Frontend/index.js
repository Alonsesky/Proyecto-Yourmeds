import notifee, { EventType } from '@notifee/react-native';
import 'expo-router/entry';
import { scheduleRealAlarm, stopAllAlarms } from './app/notifications/alarmService.notifee';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  try {
    if (type === EventType.ACTION_PRESS) {
      const id = detail.notification?.id ?? '';
      if (detail.pressAction?.id === 'taken') {
        await stopAllAlarms();
      } else if (detail.pressAction?.id === 'snooze_5') {
        await stopAllAlarms();
        const date = new Date(Date.now() + 5 * 60 * 1000);
        await scheduleRealAlarm({
          id: id || `snooze-${Date.now()}`,
          title: '⏰ Recordatorio',
          body: 'Toma tu medicamento.',
          date,
        });
      }
    }
  } catch (e) {
    console.warn('BG handler error', e);
  }
});
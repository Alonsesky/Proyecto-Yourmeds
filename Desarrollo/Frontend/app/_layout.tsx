import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';

import { initNotificationsOnce, registerAlarmListeners } from './notifications/alarmService.notifee';
import { ensureAlarmChannel, scheduleAll } from './notifications/scheduler';
import { getAlarmsFromStorageOrApi } from './services/alarm';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Oswald-Regular': require('../assets/fonts/Oswald-Regular.ttf'),
    'Oswald-Bold': require('../assets/fonts/Oswald-Bold.ttf'),
  });

  // Evita registrar dos veces en dev/StrictMode:
  const didInit = useRef(false);
  const appStateSubRef = useRef<{ remove: () => void } | null>(null);
  const unsubNotifeeForegroundRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initNotificationsOnce();
    if (didInit.current) return;
    didInit.current = true;

    let mounted = true;

    (async () => {
      // 1) Permisos (Android 13+/iOS)
      const settings = await notifee.requestPermission();
      const granted =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

      if (!granted) {
        console.warn('[notifee] Permiso de notificaciones denegado o provisional.');
      }

      // 2) Canal (Android)
      await ensureAlarmChannel();

      // 3) Listeners (una sola vez)
      //    registerAlarmListeners devuelve "unsubscribeForeground"
      const unsub = registerAlarmListeners();
      unsubNotifeeForegroundRef.current = unsub;

      // 4) Programar todo al iniciar
      const alarms = await getAlarmsFromStorageOrApi();
      if (!mounted) return;
      await scheduleAll(alarms);

      // 5) Reprogramar al volver a primer plano (por cambio de hora del sistema, etc.)
      const sub = AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
          await ensureAlarmChannel();
          const fresh = await getAlarmsFromStorageOrApi();
          await scheduleAll(fresh);
        }
      });
      appStateSubRef.current = sub;
    })();

    return () => {
      mounted = false;
      // Limpieza segura
      try {
        appStateSubRef.current?.remove?.();
      } catch {}
      try {
        unsubNotifeeForegroundRef.current?.();
      } catch {}
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0693E9" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

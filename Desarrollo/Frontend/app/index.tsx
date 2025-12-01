import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

// Solo para el botón de prueba (usa el mismo canal que el scheduler)
import { ensureAlarmChannel } from './notifications/scheduler';

export default function IndexScreen() {
  const router = useRouter();

  // Botón de prueba rápida (10s)
  const testLocal10s = useCallback(async () => {
    try {
      const settings = await notifee.requestPermission();
      const enabled =
        settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert('Permiso requerido', 'Activa las notificaciones para poder probar.');
        return;
      }

      const channelId =
        Platform.OS === 'android' ? await ensureAlarmChannel() : undefined;

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + 10_000,
        alarm: true,
        allowWhileIdle: true,
      } as unknown as TimestampTrigger;

      await notifee.createTriggerNotification(
        {
          id: `test-${Date.now()}`,
          title: 'Test local',
          body: 'Deberías ver esto en ~10 segundos.',
          android:
            Platform.OS === 'android'
              ? {
                  channelId: channelId!,
                  importance: AndroidImportance.HIGH,
                  loopSound: true,
                  pressAction: { id: 'default' },
                }
              : undefined,
        },
        trigger
      );

      Alert.alert('Listo', 'Notificación programada para ~10s.');
    } catch (e: any) {
      console.warn('Error al programar test:', e);
      Alert.alert('Error', String(e?.message ?? e));
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YourMeds</Text>

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('./(auth)/login')}
      >
        <Text style={styles.buttonText}>Empezar</Text>
      </TouchableOpacity>
    </View>
  );
}

const BLUE = '#007BFF';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: BLUE,
    marginBottom: 40,
  },
  button: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: BLUE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  secondaryText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
});

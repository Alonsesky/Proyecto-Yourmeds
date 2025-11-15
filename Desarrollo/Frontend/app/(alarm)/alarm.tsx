// app/(alarm)/alarm.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, View } from 'react-native';
import styled from 'styled-components/native';

import AlarmVar, { VariadoValue } from '../../components/AlarmVar';
import SelectAlarm, { AlarmType } from '../../components/SelectAlarm';
import SelectGroup, { GroupOption } from '../../components/SelectGroup';

import { createAlarm, updateAlarm } from '../../app/services//alarm';
import { fetchMyGroupsAndAlarms } from '../../app/services/group';
import { getGroupsSnapshot } from '../../app/services/storage';
import type { ApiGroupsResponse } from '../../app/types/groupTypes';

// Modal de error reutilizable
import ErrorDialog from '@/components/uiError/errorDesing';
import { parseApiError } from '../services/error';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export default function NewAlarmScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId?: string }>();
  const isEdit = !!alarmId;

  // Tipo de alarma ('fijo' | 'variado')
  const [alarmType, setAlarmType] = useState<AlarmType>('fijo');

  // Grupos (solo owner)
  const [group, setGroup] = useState<GroupOption | null>(null);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);

  // Nombre
  const [name, setName] = useState('');

  // Configuración “variado”
  const [variado, setVariado] = useState<VariadoValue>({
    intervalHours: null,
    startDate: null,
    endDate: null,
  });

  // Hora seleccionada
  const [time, setTime] = useState(() => {
    const d = new Date(); d.setHours(8, 30, 0, 0); return d;
  });
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);

  // TimePicker control (Android)
  const [showTimePicker, setShowTimePicker] = useState(false);
  const openTimePicker = () => setShowTimePicker(true);
  const closeTimePicker = () => setShowTimePicker(false);

  const HOURS = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const MINUTES = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  // Helpers
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const fmtTimeHHmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  const fmtYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const onTimeChange = (event: any, selected?: Date) => {
    if (Platform.OS === 'android') closeTimePicker();
    if (event?.type === 'dismissed' || !selected) return;
    setTime(selected);
    setHour(selected.getHours());
    setMinute(selected.getMinutes());
  };

  const updateFromWeb = (h: number, m: number) => {
    const d = new Date(time);
    d.setHours(h); d.setMinutes(m);
    setTime(d); setHour(h); setMinute(m);
  };

  // ===== Error dialog state =====
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | undefined>();

  // Helper para mostrar SIEMPRE el texto actual (no reciclar el anterior)
  const showError = (msg: string, details?: string) => {
    setErrorOpen(false);
    requestAnimationFrame(() => {
      setErrorMsg(msg);
      setErrorDetails(details);
      setErrorOpen(true);
    });
  };

  // Cargar grupos (solo owner) y —si estamos editando— precargar la alarma
  useEffect(() => {
    (async () => {
      try {
        // 1) Snapshot local
        const cached = await getGroupsSnapshot(); // { savedAt, data }
        let data: ApiGroupsResponse | null = cached?.data ?? null;

        // 2) Si falta, intentar refrescar
        if (!data || !Array.isArray(data.groups)) {
          try {
            data = await fetchMyGroupsAndAlarms();
          } catch {}
        }
        if (!data) {
          setGroupOptions([]);
          setGroup(null);
          showError('No fue posible obtener tus grupos.');
          return;
        }

        const userId = Number(data.userId);

        // 3) Solo grupos donde soy owner
        const ownerGroups = (data.groups || []).filter((g: any) => {
          if (typeof g?.owner === 'boolean') return g.owner === true;
          if (Array.isArray(g?.users)) {
            return g.users.some((u: any) => Number(u?.id) === userId && u?.isOwner === true);
          }
          return false;
        });

        const opts = ownerGroups.map((g: any) => ({
          id: String(g.groupId),
          name: g.name,
        }));
        setGroupOptions(opts);
        if (!isEdit) setGroup(opts[0] ?? null);

        // 4) Si es edición, buscar la alarma en cualquiera de mis grupos
        if (isEdit && data.groups?.length) {
          let found: any | null = null;
          let foundGroupId: number | null = null;
          for (const g of data.groups) {
            const hit = (g.alarms || []).find((a: any) => String(a.id) === String(alarmId));
            if (hit) {
              found = hit;
              foundGroupId = g.groupId;
              break;
            }
          }
          if (!found) {
            showError('No se encontró la alarma a editar.');
          } else {
            setName(found.name ?? found.medicineName ?? '');
            const isVariado = !!found.alarm_type;
            setAlarmType(isVariado ? 'variado' : 'fijo');

            const t = (found.time_alarm ?? found.time ?? '08:30').split(':');
            const h = Number(t[0] ?? 8);
            const m = Number(t[1] ?? 30);
            updateFromWeb(h, m);

            const gOpt = opts.find(o => o.id === String(foundGroupId ?? found.group_id));
            if (gOpt) setGroup(gOpt);

            if (isVariado) {
              const start = found.date_start ?? found.startDate ?? null;
              const end = found.date_end ?? found.endDate ?? null;
              const interval = found.interval_hours ?? found.intervalHours ?? null;
              setVariado({
                startDate: start ? new Date(start) : null,
                endDate: end ? new Date(end) : null,
                intervalHours: interval ? Number(interval) : null,
              });
            }
          }
        }

        // 5) Sin grupos propios: mensaje exacto y corte de flujo
        if (opts.length === 0) {
          showError('No tienes grupos propios. Crea un grupo para asociar alarmas.', undefined);
          return;
        }
      } catch (e: any) {
        const { msg, details } = parseApiError(e, { fallback: 'No fue posible cargar datos.' });
        showError(msg, details);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, alarmId]);

  // Guardar (crear/actualizar)
  const onConfirm = async () => {
    try {
      if (!name.trim()) {
        showError('Falta información: ingresa el nombre de la alarma.');
        return;
      }
      if (!group) {
        showError('Falta información: selecciona un grupo.');
        return;
      }

      const time_alarm = fmtTimeHHmm(time);
      const alarm_type = (alarmType === 'variado'); // variado=true, fijo=false

      // Construir payload básico
      const payload: any = {
        name: name.trim(),
        alarm_type,          // false=fijo, true=variado
        active: true,
        cant: 1,
        time_alarm,
        group_id: Number(group.id),
      };

      if (alarm_type) {
        if (!variado.startDate || !variado.endDate || !variado.intervalHours) {
          showError('Completa rango de fechas e intervalo (horas) para alarmas variadas.');
          return;
        }
        payload.date_start = fmtYmd(new Date(variado.startDate));
        payload.date_end = fmtYmd(new Date(variado.endDate));
        payload.interval_hours = Number(variado.intervalHours);
      } else {
        payload.date_start = fmtYmd(new Date());
      }

      if (isEdit) {
        await updateAlarm(String(alarmId), payload);
      } else {
        await createAlarm(payload);
      }
      router.back();
    } catch (err: any) {
      const { msg, details } = parseApiError(err);
      showError(msg, details);
    }
  };

  return (
    <Screen>
      <Safe style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* Header */}
        <HeaderBar>
          <HeaderTitle>{isEdit ? 'EDITAR ALARMA' : 'NUEVA ALARMA'}</HeaderTitle>
          <CloseBtn onPress={() => router.back()} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={40} color={BLUE} />
          </CloseBtn>
        </HeaderBar>

        {/* Nombre */}
        <Section style={{ marginTop: 12, paddingHorizontal: 20 }}>
          <Label>NOMBRE DE LA ALARMA</Label>
          <TextInputEl
            placeholder="Ej: Vitamina C"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9bbce0"
          />
        </Section>

        {/* Hora */}
        <Section style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <Label>HORA</Label>

          {Platform.OS === 'web' ? (
            <WebTimeRow>
              <WebCol>
                <WebPickerWrapper>
                  <Picker
                    selectedValue={hour}
                    onValueChange={(v) => updateFromWeb(v as number, minute)}
                    dropdownIconColor={BLUE}
                    style={{ height: 44, width: '100%' }}
                  >
                    {HOURS.map((h) => (
                      <Picker.Item key={h} label={String(h).padStart(2, '0')} value={h} />
                    ))}
                  </Picker>
                </WebPickerWrapper>
              </WebCol>

              <Colon>:</Colon>

              <WebCol>
                <WebPickerWrapper>
                  <Picker
                    selectedValue={minute}
                    onValueChange={(v) => updateFromWeb(hour, v as number)}
                    dropdownIconColor={BLUE}
                    style={{ height: 44, width: '100%' }}
                  >
                    {MINUTES.map((m) => (
                      <Picker.Item key={m} label={String(m).padStart(2, '0')} value={m} />
                    ))}
                  </Picker>
                </WebPickerWrapper>
              </WebCol>
            </WebTimeRow>
          ) : (
            <>
              <FakeInput onPress={openTimePicker} activeOpacity={0.8}>
                <FakeInputText>
                  {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                </FakeInputText>
                <Ionicons name="time-outline" size={20} color={BLUE} />
              </FakeInput>

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour
                  display="clock"
                  onChange={onTimeChange}
                />
              )}
            </>
          )}
        </Section>

        {/* Tipo */}
        <Section style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <Label>TIPO DE ALARMA</Label>
          <SelectAlarm value={alarmType} onChange={setAlarmType} />
        </Section>

        {/* Variado: fechas */}
        {alarmType === 'variado' && (
          <AlarmVar
            value={variado}
            onChange={(patch) => setVariado((old) => ({ ...old, ...patch }))}
          />
        )}

        {/* Grupo (solo owner) */}
        <Section style={{ marginTop: 16 }}>
          <SelectGroup
            value={group}
            onChange={setGroup}
            options={groupOptions}
            inset={21}
          />
        </Section>

        {/* Confirmar / Guardar */}
        <Footer>
          <ConfirmBtn onPress={onConfirm} activeOpacity={0.9}>
            <ConfirmText>{isEdit ? 'GUARDAR' : 'CONFIRMAR'}</ConfirmText>
            <Badge>
              <Ionicons name="checkmark" size={18} color={BLUE} />
            </Badge>
          </ConfirmBtn>
        </Footer>
      </Safe>

      {/* Modal de error unificado */}
      <ErrorDialog
        key={errorMsg}              // fuerza remount cuando cambia el texto
        visible={errorOpen}
        title="No se pudo continuar"
        message={errorMsg}
        details={errorDetails}
        onClose={() => setErrorOpen(false)}
        primaryLabel="Entendido"
      />
    </Screen>
  );
}

/* ================== Estilos generales ================== */
const Screen = styled.View({
  flex: 1,
  backgroundColor: WHITE,
});

const Safe = styled(SafeAreaView)({
  paddingHorizontal: 18,
});

const HeaderBar = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingBottom: 8,
});

const HeaderTitle = styled.Text({
  fontSize: 28,
  color: BLUE,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const CloseBtn = styled.TouchableOpacity({
  padding: 6,
  borderRadius: 10,
});

const Section = styled.View({});

const Label = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const TextInputEl = styled.TextInput({
  height: 44,
  borderRadius: 22,
  paddingHorizontal: 16,
  backgroundColor: '#F0F7FF',
  borderWidth: 2,
  borderColor: '#C8E1FA',
  color: '#013b63',
});

const WebTimeRow = styled(View)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
});

const WebCol = styled(View)({
  minWidth: 120,
});

const WebPickerWrapper = styled(View)({
  height: 44,
  borderRadius: 22,
  paddingHorizontal: 12,
  backgroundColor: '#F0F7FF',
  borderWidth: 2,
  borderColor: '#C8E1FA',
  justifyContent: 'center',
});

const Colon = styled.Text({
  fontSize: 44,
  fontWeight: '900',
  color: BLUE,
  marginHorizontal: 6,
  marginBottom: 6,
});

const Footer = styled.View({
  paddingHorizontal: 18,
  paddingVertical: 18,
  alignItems: 'center',
});

const ConfirmBtn = styled.TouchableOpacity({
  backgroundColor: BLUE,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 18,
  minWidth: 230,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 12,
});

const ConfirmText = styled.Text({
  color: WHITE,
  fontWeight: '900',
  letterSpacing: 0.6,
});

const Badge = styled.View({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: WHITE,
});

// Hora Android “simulada”
const FakeInput = styled.TouchableOpacity({
  height: 44,
  borderRadius: 22,
  paddingHorizontal: 16,
  backgroundColor: '#F0F7FF',
  borderWidth: 2,
  borderColor: '#C8E1FA',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const FakeInputText = styled.Text({
  color: '#013b63',
  fontWeight: '600',
});

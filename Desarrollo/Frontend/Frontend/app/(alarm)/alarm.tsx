// app/(alarm)/alarm.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, View } from 'react-native';
import styled from 'styled-components/native';

import AlarmVar, { VariadoValue } from '../../components/AlarmVar';
import SelectAlarm, { AlarmType } from '../../components/SelectAlarm';
import SelectGroup, { GroupOption } from '../../components/SelectGroup';

import { createAlarm } from '../../app/services//alarm';
import { fetchMyGroupsAndAlarms } from '../../app/services/group';
import { getGroupsSnapshot } from '../../app/services/storage';
import type { ApiGroupsResponse } from '../../app/types/groupTypes';


const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export default function NewAlarmScreen() {
  const router = useRouter();

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
  const addYears = (d: Date, years: number) => {
    const x = new Date(d); x.setFullYear(x.getFullYear() + years); return x;
  };

  const onTimeChange = (event: any, selected?: Date) => {
    // Android: cerrar siempre
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

  // Cargar grupos desde API y filtrar owner
  useEffect(() => {
  (async () => {
    try {
      // 1) Intentar desde snapshot local
      const cached = await getGroupsSnapshot(); // { savedAt, data }
      let data: ApiGroupsResponse | null = cached?.data ?? null;

      // 2) Si no hay snapshot válido, pedir al backend como respaldo
      if (!data || !Array.isArray(data.groups)) {
        try {
          data = await fetchMyGroupsAndAlarms();
        } catch (e) {
          console.warn('No se pudo refrescar overview desde API:', e);
        }
      }

      if (!data) {
        setGroupOptions([]);
        setGroup(null);
        Alert.alert('Sin datos', 'No fue posible obtener tus grupos.');
        return;
      }

      const userId = Number(data.userId);

      // 3) Filtrar SOLO grupos donde el usuario es owner
      //    Regla:
      //    - Si el DTO trae "owner" a nivel de grupo → usarlo.
      //    - Si no, derivar desde users[] buscando el userId con isOwner=true.
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
        icon: '📦',
      }));

      setGroupOptions(opts);
      setGroup(opts[0] ?? null);

      if (opts.length === 0) {
        Alert.alert(
          'Sin grupos propios',
          'No tienes grupos donde seas propietario. Crea uno para poder asociar alarmas.'
        );
      }
    } catch (e) {
      console.error('Error cargando grupos (snapshot/owner):', e);
      Alert.alert('Error', 'No fue posible cargar tus grupos.');
    }
  })();
}, []);

  // Crear alarma
  const onConfirm = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Falta información', 'Ingresa el nombre de la alarma.');
        return;
      }
      if (!group) {
        Alert.alert('Falta información', 'Selecciona un grupo.');
        return;
      }

      const time_alarm = fmtTimeHHmm(time);
      const alarm_type = (alarmType === 'variado'); // variado=true, fijo=false

      let date_start: string;
      let date_end: string;

      if (alarm_type) {
        // Variado: usar fechas elegidas y el intervalo
        if (!variado.startDate || !variado.endDate || !variado.intervalHours) {
          Alert.alert('Falta información', 'Completa rango de fechas e intervalo (horas).');
          return;
        }
        const s = new Date(variado.startDate);
        const e = new Date(variado.endDate);
        date_start = fmtYmd(s);
        date_end = fmtYmd(e);
      } else {
        // Fijo: el backend normaliza date_end (permanente)
        const today = new Date();
        date_start = fmtYmd(today);
        date_end = ""; // NO enviar date_end en fijo
      }

      // Construir payload condicional
      const payload: any = {
        name: name.trim(),
        alarm_type,          // false=fijo, true=variado
        active: true,
        cant: 1,
        time_alarm,
        date_start,
        group_id: Number(group.id),
      };

      // Solo para variado agregamos date_end + interval_hours
      if (alarm_type) {
        payload.date_end = date_end;
        payload.interval_hours = Number(variado.intervalHours);
      }
    

      const res = await createAlarm(payload);
      Alert.alert('Éxito ✅', `Alarma creada: ${res.name}`);
      router.back();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error ❌', err?.message ?? 'No se pudo crear la alarma.');
    }
  };

  return (
    <Screen>
      <Safe style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* Header */}
        <HeaderBar>
          <HeaderTitle>NUEVA ALARMA</HeaderTitle>
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
                  display="clock" // más estable que "spinner" en Android
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

        {/* Confirmar */}
        <Footer>
          <ConfirmBtn onPress={onConfirm} activeOpacity={0.9}>
            <ConfirmText>CONFIRMAR</ConfirmText>
            <Badge>
              <Ionicons name="checkmark" size={18} color={BLUE} />
            </Badge>
          </ConfirmBtn>
        </Footer>
      </Safe>
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

const PickerWrap = styled(View)({
  alignItems: 'center',
  justifyContent: 'center',
});

/* ======= Web styles (fallback) ======= */
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

/* ======= Footer & Confirm button ======= */
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

// SUMULACION HORA ANDROID
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
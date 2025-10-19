// app/(alarm)/alarm.tsx
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, View } from 'react-native';
import styled from 'styled-components/native';

import AlarmVar, { VariadoValue } from '../../components/AlarmVar';
import SelectAlarm, { AlarmType } from '../../components/SelectAlarm';
import SelectGroup, { GroupOption } from '../../components/SelectGroup';
import SelectMedicine, { MedicineOption } from '../../components/SelectMedic';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

/* ===== Demo de Grupos (luego vendrá del backend) ===== */
const GROUPS: GroupOption[] = [
  { id: 'g1', name: 'Grupo Personal', icon: '👤' },
  { id: 'g2', name: 'Grupo Familiar', icon: '👨‍👩‍👧‍👦' },
  { id: 'g3', name: 'Grupo Cuidador', icon: '🩺' },
];

/* ===== Demo de medicamentos (luego vendrá del backend) ===== */
const MEDS: MedicineOption[] = [
  { id: '1', name: 'Paracetamol 500mg', icon: '💊' },
  { id: '2', name: 'Ibuprofeno 400mg',  icon: '🧪' },
  { id: '3', name: 'Omeprazol 20mg',    icon: '🧴' },
  { id: '4', name: 'Amoxicilina 500mg', icon: '🧬' },
  { id: '5', name: 'Loratadina 10mg',   icon: '🌿' },
];

export default function NewAlarmScreen() {
  const router = useRouter();

  // Tipo de alarma ('fijo' | 'variado')
  const [alarmType, setAlarmType] = useState<AlarmType>('fijo');

  // Grupo seleccionado
  const [group, setGroup] = useState<GroupOption | null>(null);

  // Configuración de “variado”
  const [variado, setVariado] = useState<VariadoValue>({
    intervalHours: null,
    startDate: null,
    endDate: null,
  });

  // Medicamento seleccionado
  const [med, setMed] = useState<MedicineOption | null>(null);

  // Hora seleccionada como Date + mirrors (hora/minuto) para web
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 30, 0, 0);
    return d;
  });
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(30);

  const HOURS = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const MINUTES = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const onChangeNative = (_event: any, selected?: Date) => {
    if (!selected) return; // Android puede cancelar
    setTime(selected);
    setHour(selected.getHours());
    setMinute(selected.getMinutes());
  };

  // Sincroniza cuando el usuario cambia en web
  const updateFromWeb = (h: number, m: number) => {
    const d = new Date(time);
    d.setHours(h);
    d.setMinutes(m);
    setTime(d);
    setHour(h);
    setMinute(m);
  };

  // -------- Confirmar --------
  const onConfirm = () => {
    // Validaciones mínimas
    if (!med) {
      Alert.alert('Falta información', 'Selecciona un medicamento.');
      return;
    }
    if (!group) {
      Alert.alert('Falta información', 'Selecciona un grupo.');
      return;
    }

    const base = {
      medicineId: med?.id ?? null,
      medicineName: med?.name ?? null,
      alarmType,
      groupId: group?.id ?? null,
      groupName: group?.name ?? null,
    };

    if (alarmType === 'fijo') {
      const payload = {
        ...base,
        schedule: {
          mode: 'fixed' as const,
          hour: time.getHours(),
          minute: time.getMinutes(),
          nextAtISO: time.toISOString(),
        },
      };
      console.log('NEW ALARM PAYLOAD', payload);
       router.back(); // <- si quieres cerrar después
      return;
    }

    // variado
    if (!variado.intervalHours || !variado.startDate || !variado.endDate) {
      Alert.alert(
        'Falta información',
        'Completa el intervalo de horas y el rango de fechas.'
      );
      return;
    }

    const payload = {
      ...base,
      schedule: {
        mode: 'variable' as const,
        intervalHours: variado.intervalHours,
        startDateISO: new Date(variado.startDate).toISOString(),
        endDateISO: new Date(variado.endDate).toISOString(),
      },
    };
    console.log('NEW ALARM PAYLOAD', payload);
    // router.back(); // <- si quieres cerrar después
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

        {/* Select de medicamento */}
        <SelectMedicine
          value={med}
          onChange={setMed}
          options={MEDS}
          label="NOMBRE DE LA ALARMA"
          placeholder="Nombre del medicamento"
          inset={21}
        />

        {/* Hora próxima */}
        <Section style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <Label>HORA PRÓXIMA</Label>

          {Platform.OS !== 'web' ? (
            <PickerWrap>
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                is24Hour
                minuteInterval={1}
                onChange={onChangeNative}
                themeVariant="light"
                style={{ height: 190 }}
              />
            </PickerWrap>
          ) : (
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
          )}
        </Section>

        {/* Tipo de alarma */}
        <Section style={{ marginTop: 16, paddingHorizontal: 20 }}>
          <Label>TIPO DE ALARMA</Label>
          <SelectAlarm value={alarmType} onChange={setAlarmType} />
        </Section>

        {/* Opciones adicionales para 'variado' */}
        {alarmType === 'variado' && (
          <AlarmVar
            value={variado}
            onChange={(patch) => setVariado((old) => ({ ...old, ...patch }))}
          />
        )}

        {/* Grupo perteneciente */}
        <Section style={{ marginTop: 16 }}>
          <SelectGroup
            value={group}
            onChange={setGroup}
            options={GROUPS}
            inset={21}
          />
        </Section>

        {/* Botón Confirmar */}
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

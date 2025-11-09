import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import DatePickerDialog from '../components/SelectDate';

const BLUE = '#0693E9';
const WHITE = '#fff';

/* ---------- Tipos ---------- */
export type VariadoValue = {
  intervalHours: number | null;  // cada cuántas horas tomar (1..14)
  startDate: Date | null;        // fecha inicio
  endDate: Date | null;          // fecha fin
};

type Props = {
  value: VariadoValue;
  onChange: (patch: Partial<VariadoValue>) => void;
  inset?: number;
};

/* ---------- Utils ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date | null) =>
  d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : 'Fecha';

/* ---------- Componente ---------- */
export default function AlarmVar({ value, onChange, inset = 21 }: Props) {
  // modal de intervalos (lista)
  const [openInterval, setOpenInterval] = useState(false);

  // diálogos de fecha (paper-dates)
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  // Lista 1..14 horas
  const INTERVALS = useMemo(() => Array.from({ length: 14 }, (_, i) => i + 1), []);
  const intervalLabel = value.intervalHours
    ? `Cada ${value.intervalHours} ${value.intervalHours === 1 ? 'hora' : 'horas'}`
    : 'Indicar Hora';

  // Restricciones de fecha (desde hoy a las 00:00)
  const today00 = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const minStart = today00;
  const minEnd = value.startDate ? new Date(new Date(value.startDate).setHours(0,0,0,0)) : today00;

  // Valores base para abrir diálogos
  const baseStart = value.startDate ?? today00;
  const baseEnd   = value.endDate   ?? (value.startDate ?? today00);

  return (
    <Wrap style={{ paddingHorizontal: inset }}>
      {/* Toma de medicamento (intervalo) */}
      <Label>TOMA DE MEDICAMENTO</Label>
      <Pill onPress={() => setOpenInterval(true)} activeOpacity={0.9}>
        <PillText numberOfLines={1}>{intervalLabel}</PillText>
        <RightCircle><Ionicons name="chevron-down" size={18} color={BLUE} /></RightCircle>
      </Pill>

      {/* Rango de día */}
      <Label style={{ marginTop: 14 }}>RANGO DE DÍA</Label>

      <Pill onPress={() => setOpenStart(true)} activeOpacity={0.9} style={{ marginBottom: 10 }}>
        <LeftBadge>Fecha Inicio</LeftBadge>
        <PillText numberOfLines={1}>{fmtDate(value.startDate)}</PillText>
        <RightCircle><Ionicons name="chevron-down" size={18} color={BLUE} /></RightCircle>
      </Pill>

      <Pill onPress={() => setOpenEnd(true)} activeOpacity={0.9}>
        <LeftBadge>Fecha Fin</LeftBadge>
        <PillText numberOfLines={1}>{fmtDate(value.endDate)}</PillText>
        <RightCircle><Ionicons name="chevron-down" size={18} color={BLUE} /></RightCircle>
      </Pill>

      {/* ===== Modal de intervalos 1..14 ===== */}
      {openInterval && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setOpenInterval(false)}>
          <Backdrop activeOpacity={1} onPress={() => setOpenInterval(false)}>
            <Sheet activeOpacity={1}>
              <FlatList
                data={INTERVALS}
                keyExtractor={(n) => String(n)}
                renderItem={({ item }) => (
                  <Row
                    onPress={() => { onChange({ intervalHours: item }); setOpenInterval(false); }}
                    activeOpacity={0.85}
                  >
                    <RowText>Cada {item} {item === 1 ? 'hora' : 'horas'}</RowText>
                    {value.intervalHours === item && (
                      <Ionicons name="checkmark-circle" size={22} color={BLUE} />
                    )}
                  </Row>
                )}
                ItemSeparatorComponent={() => <Sep />}
                contentContainerStyle={{ paddingVertical: 8 }}
                style={{ maxHeight: 360 }}
              />
            </Sheet>
          </Backdrop>
        </Modal>
      )}

      {/* ===== Diálogo Material: Fecha inicio ===== */}
      <DatePickerDialog
        visible={openStart}
        value={baseStart}
        minDate={minStart}
        onDismiss={() => setOpenStart(false)}
        onConfirm={(d) => {
          const start = new Date(d); start.setHours(0,0,0,0);
          const mustBumpEnd =
            value.endDate && new Date(value.endDate).getTime() < start.getTime();
          onChange({ startDate: start, endDate: mustBumpEnd ? start : value.endDate });
          setOpenStart(false);
        }}
      />

      {/* ===== Diálogo Material: Fecha fin ===== */}
      <DatePickerDialog
        visible={openEnd}
        value={baseEnd}
        minDate={minEnd}
        onDismiss={() => setOpenEnd(false)}
        onConfirm={(d) => {
          const end = new Date(d); end.setHours(0,0,0,0);
          onChange({ endDate: end });
          setOpenEnd(false);
        }}
      />
    </Wrap>
  );
}

/* ---------- Estilos ---------- */
const Wrap = styled.View({});
const Label = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Pill = styled.TouchableOpacity({
  backgroundColor: BLUE,
  borderRadius: 24,
  paddingVertical: 12,
  paddingLeft: 16,
  paddingRight: 48,
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const PillText = styled.Text({
  color: '#E6F4FF',
  fontWeight: '800',
  flex: 1,
  textAlign: 'left',
  paddingLeft: 6,
});

const RightCircle = styled.View({
  position: 'absolute',
  right: 8,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: BLUE,
});

const LeftBadge = styled.Text({
  backgroundColor: '#fff',
  color: BLUE,
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  fontWeight: '800',
});

const Backdrop = styled.TouchableOpacity({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'flex-end',
});

const Sheet = styled(TouchableOpacity)({
  backgroundColor: WHITE,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 12,
});

const SheetActions = styled.View({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  paddingTop: 8,
});

const Action = styled.TouchableOpacity({
  paddingVertical: 10,
  paddingHorizontal: 10,
});

const ActionText = styled.Text({
  color: BLUE,
  fontWeight: '900',
});

/* fila lista intervalos */
const Row = styled.TouchableOpacity({
  paddingVertical: 12,
  paddingHorizontal: 6,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});
const RowText = styled.Text({
  color: '#123',
  fontWeight: '700',
});
const Sep = styled.View({
  height: 1,
  backgroundColor: 'rgba(0,0,0,0.06)',
});

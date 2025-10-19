// components/SelectAlarm.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import styled from 'styled-components/native';

export type AlarmType = 'fijo' | 'variado';

type Props = {
  value: AlarmType;
  onChange: (v: AlarmType) => void;
  inset?: number; // margen horizontal externo si lo necesitas en algún contenedor
};

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export default function SelectAlarm({ value, onChange, inset = 0 }: Props) {
  const isFijo = value === 'fijo';
  const isVariado = value === 'variado';

  return (
    <Wrap style={{ paddingHorizontal: inset }}>
      <Pill>
        {/* Segmento FIJO */}
        <Segment onPress={() => onChange('fijo')} activeOpacity={0.85}>
          <SegText active={isFijo}>FIJO</SegText>
          {isFijo ? <CheckCircle /> : <HollowCircle />}
        </Segment>

        {/* Punto central decorativo */}
        <CenterDotWrap>
        </CenterDotWrap>

        {/* Segmento VARIADO */}
        <Segment onPress={() => onChange('variado')} activeOpacity={0.85}>
          <SegText active={isVariado}>VARIADO</SegText>
          {isVariado ? <CheckCircle /> : <HollowCircle />}
        </Segment>
      </Pill>
    </Wrap>
  );
}

/* ============ estilos ============ */

const Wrap = styled.View({});

const Pill = styled.View({
  backgroundColor: BLUE,
  borderRadius: 28,
  paddingVertical: 12,
  paddingHorizontal: 18,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
});

const Segment = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
  // Cada lado toma el mismo ancho y distribuye texto + indicador
  flex: 1,
  justifyContent: 'center',
  gap: 10,
});

const SegText = styled.Text<{ active: boolean }>(({ active }) => ({
  color: WHITE,
  fontWeight: '900',
  letterSpacing: 0.4,
  opacity: active ? 1 : 0.95,
}));

const CenterDotWrap = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
});

const CenterDotDot = styled.View({
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: WHITE,
  opacity: 0.95,
});

/** Círculo blanco vacío (opción inactiva) */
const HollowCircle = styled.View({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: WHITE,
});

/** Círculo blanco con check (opción activa) */
function CheckCircle() {
  return (
    <CheckWrap>
      <Ionicons name="checkmark" size={16} color={BLUE} />
    </CheckWrap>
  );
}

const CheckWrap = styled.View({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: WHITE,
});

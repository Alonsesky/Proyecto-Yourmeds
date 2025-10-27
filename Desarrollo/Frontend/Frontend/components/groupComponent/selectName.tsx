// components/SelectName.tsx
import React from 'react';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

type Props = {
  value: string;
  onChange: (v: string) => void;
  label?: string;        // por defecto: "NOMBRE GRUPO"
  placeholder?: string;  // por defecto: "Escribir Nombre"
  inset?: number;        // margen horizontal externo opcional
  maxLength?: number;    // por si quieres limitar caracteres
};

export default function SelectName({
  value,
  onChange,
  label = 'NOMBRE GRUPO',
  placeholder = 'Escribir Nombre',
  inset = 21,
  maxLength = 60,
}: Props) {
  return (
    <Wrap style={{ paddingHorizontal: inset }}>
      <FieldLabel>{label}</FieldLabel>

      <Pill>
        <NameInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#E6F4FF"
          maxLength={maxLength}
          autoCapitalize="sentences"
          returnKeyType="done"
          blurOnSubmit
        />
      </Pill>
    </Wrap>
  );
}

/* ===== estilos ===== */
const Wrap = styled.View({});

const FieldLabel = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Pill = styled.View({
  backgroundColor: BLUE,
  borderRadius: 24,
  paddingVertical: 10,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
});

const NameInput = styled.TextInput({
  flex: 1,
  color: WHITE,
  fontWeight: '800',
  fontSize: 14,
  paddingVertical: 6,
});

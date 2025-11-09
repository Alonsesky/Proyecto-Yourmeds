// components/DatePickerDialog.tsx
import React from 'react';
import { DatePickerModal, es, registerTranslation } from 'react-native-paper-dates';

registerTranslation('es', es);

type Props = {
  visible: boolean;
  value: Date;                // fecha a mostrar
  minDate?: Date;             // fecha mínima permitida
  onConfirm: (d: Date) => void;
  onDismiss: () => void;
};

export default function DatePickerDialog({ visible, value, minDate, onConfirm, onDismiss }: Props) {
  return (
    <DatePickerModal
      locale="es"
      mode="single"
      visible={visible}
      date={value}
      onDismiss={onDismiss}
      onConfirm={({ date }) => { if (date) onConfirm(date); }}
      validRange={minDate ? { startDate: minDate } : undefined}
      saveLabel="Aceptar"
      label="Selecciona fecha"
      uppercase={false}
    />
  );
}

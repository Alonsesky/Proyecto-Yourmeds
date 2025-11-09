import React, { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type GroupTypeKey = 'privado' | 'compartido';

export type Option = {
  key: GroupTypeKey;
  label: string;
};

type Props = {
  value: GroupTypeKey;
  onChange: (key: GroupTypeKey) => void;
  options?: Option[]; // por si más adelante quieres personalizar
};

export default function GroupTypePicker({
  value,
  onChange,
  options = [
    { key: 'privado', label: 'Privado' },
    { key: 'compartido', label: 'Compartido' },
  ],
}: Props) {
  const [open, setOpen] = useState(false);

  const current = options.find((o) => o.key === value)?.label ?? '—';

  return (
    <>
      <Pill onPress={() => setOpen(true)} activeOpacity={0.9}>
        <PillText>{current}</PillText>
        <Arrow>▾</Arrow>
      </Pill>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Backdrop onPress={() => setOpen(false)}>
          <Pressable>
            <Sheet onStartShouldSetResponder={() => true}>
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.key)}
                renderItem={({ item }) => (
                  <OptionRow
                    onPress={() => {
                      onChange(item.key);
                      setOpen(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <OptionText>{item.label}</OptionText>
                  </OptionRow>
                )}
              />
            </Sheet>
          </Pressable>
        </Backdrop>
      </Modal>
    </>
  );
}

// ——— estilos ———
const Pill = styled.TouchableOpacity({
  height: 44,
  minWidth: 160,
  paddingHorizontal: 16,
  borderRadius: 24,
  backgroundColor: BLUE,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});

const PillText = styled.Text({
  color: WHITE,
  fontWeight: '800',
  fontSize: 14,
});

const Arrow = styled.Text({
  color: WHITE,
  fontSize: 16,
  fontWeight: '800',
});

const Backdrop = styled.Pressable({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
});

const Sheet = styled.View({
  width: 260,
  backgroundColor: WHITE,
  borderRadius: 16,
  overflow: 'hidden',
  // opcional: sombra
  elevation: 6,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
});

const OptionRow = styled.TouchableOpacity({
  paddingVertical: 14,
  paddingHorizontal: 16,
});

const OptionText = styled.Text({
  fontSize: 16,
  fontWeight: '700',
  color: BLUE,
});

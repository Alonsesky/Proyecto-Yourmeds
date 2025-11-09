import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#fff';
const BG   = '#F7FAFF';

export type GroupOption = { id: string; name: string; icon?: string; color?: string };

type Props = {
  label?: string;
  value: GroupOption | null;
  onChange: (opt: GroupOption) => void;
  options: GroupOption[];
  placeholder?: string;
  inset?: number;                 // margen horizontal como en SelectMedicine
};

export default function SelectGroup({
  label = 'GRUPO PERTENECIENTE',
  value,
  onChange,
  options,
  placeholder = 'Seleccionar Grupo',
  inset = 21,
}: Props) {
  const [open, setOpen] = useState(false);

  const choose = (opt: GroupOption) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <Container style={{ paddingHorizontal: inset }}>
      <Label>{label}</Label>

      <Field onPress={() => setOpen(true)} activeOpacity={0.9}>
        <FieldText numberOfLines={1}>{value?.name ?? placeholder}</FieldText>

        <RightCircle>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={BLUE} />
        </RightCircle>
      </Field>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Backdrop activeOpacity={1} onPress={() => setOpen(false)}>
          <Sheet activeOpacity={1}>
            <FlatList
              data={options}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <Row onPress={() => choose(item)} activeOpacity={0.85}>
                  <Left>
                    <Emoji style={{ color: item.color ?? '#333' }}>{item.icon ?? '👥'}</Emoji>
                    <RowText numberOfLines={1}>{item.name}</RowText>
                  </Left>

                  {value?.id === item.id && (
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
    </Container>
  );
}

/* ===== estilos ===== */
const Container = styled.View({});

const Label = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Field = styled.TouchableOpacity({
  backgroundColor: BLUE,
  borderRadius: 28,
  paddingVertical: 14,
  paddingLeft: 16,
  paddingRight: 48,
  alignItems: 'center',
  flexDirection: 'row',
});

const FieldText = styled.Text({
  color: '#E6F4FF',
  fontWeight: '800',
  flex: 1,
  textAlign: 'center',
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
  paddingBottom: 24,
});

const Row = styled.TouchableOpacity({
  paddingVertical: 12,
  paddingHorizontal: 6,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Left = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  gap: 10,
});

const Emoji = styled.Text({
  fontSize: 18,
});

const RowText = styled.Text({
  flex: 1,
  color: '#123',
  fontWeight: '700',
});

const Sep = styled.View({
  height: 1,
  backgroundColor: 'rgba(0,0,0,0.06)',
});

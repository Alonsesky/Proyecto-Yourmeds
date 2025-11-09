// components/SelectMedicine.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, TouchableOpacity, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#fff';
const BG   = '#F7FAFF';

export type MedicineOption = { id: string; name: string; icon?: string };

type Props = {
  label?: string;
  value: MedicineOption | null;
  onChange: (opt: MedicineOption) => void;
  options: MedicineOption[];
  placeholder?: string;
  /** padding horizontal externo del control (por defecto 16) */
  inset?: number;
  /** estilos extra para el contenedor externo (si prefieres controlar tú) */
  containerStyle?: ViewStyle;
};

export default function SelectMedicine({
  label = 'NOMBRE DE LA ALARMA',
  value,
  onChange,
  options,
  placeholder = 'Nombre del medicamento',
  inset = 16,
  containerStyle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(o => o.name.toLowerCase().includes(s));
  }, [q, options]);

  const choose = (opt: MedicineOption) => {
    onChange(opt);
    setOpen(false);
    setQ('');
  };

  return (
    <Outer style={[{ paddingHorizontal: inset }, containerStyle]}>
      <Label>{label}</Label>

      <Field onPress={() => setOpen(true)} activeOpacity={0.9}>
        <FieldText numberOfLines={1}>
          {value?.name ?? placeholder}
        </FieldText>

        <RightCircle>
          <Ionicons name={open ? 'chevron-up' : 'search'} size={18} color={BLUE} />
        </RightCircle>
      </Field>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Backdrop activeOpacity={1} onPress={() => setOpen(false)}>
          <Sheet activeOpacity={1}>
            <SheetHeader>
              <SearchWrap>
                <Ionicons name="search" size={18} color={BLUE} />
                <SearchInput
                  placeholder="Buscar medicamento…"
                  placeholderTextColor="#9BBEEA"
                  value={q}
                  onChangeText={setQ}
                />
                {!!q && (
                  <Clear onPress={() => setQ('')}>
                    <Ionicons name="close-circle" size={18} color="#9BBEEA" />
                  </Clear>
                )}
              </SearchWrap>
              <Close onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={BLUE} />
              </Close>
            </SheetHeader>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Row onPress={() => choose(item)} activeOpacity={0.85}>
                  <Left>
                    <Emoji>{item.icon ?? '💊'}</Emoji>
                    <RowText numberOfLines={1}>{item.name}</RowText>
                  </Left>
                  {value?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color={BLUE} />
                  )}
                </Row>
              )}
              ItemSeparatorComponent={() => <Sep />}
              ListEmptyComponent={<Empty>Sin resultados para “{q}”.</Empty>}
              contentContainerStyle={{ paddingVertical: 8 }}
              style={{ maxHeight: 360 }}
            />
          </Sheet>
        </Backdrop>
      </Modal>
    </Outer>
  );
}

/* ====== estilos ====== */

const Outer = styled.View({
  // 👈 aquí metemos el padding lateral para que no “pegue” a los bordes
  paddingHorizontal: 16,
});

const Label = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Field = styled.TouchableOpacity({
  backgroundColor: BLUE,
  borderRadius: 20,
  paddingVertical: 12,
  paddingLeft: 16,
  paddingRight: 48, // espacio para el circulito
  alignItems: 'center',
  flexDirection: 'row',
});

const FieldText = styled.Text({
  color: '#E6F4FF',
  fontWeight: '700',
  flex: 1,
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

const SheetHeader = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
});

const SearchWrap = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: BG,
  borderRadius: 12,
  paddingHorizontal: 10,
  height: 42,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.08)',
});

const SearchInput = styled.TextInput({
  flex: 1,
  marginLeft: 8,
  color: '#13324B',
});

const Clear = styled.TouchableOpacity({
  padding: 4,
});

const Close = styled.TouchableOpacity({
  marginLeft: 10,
  padding: 6,
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

const Empty = styled.Text({
  textAlign: 'center',
  color: '#678',
  paddingVertical: 18,
});

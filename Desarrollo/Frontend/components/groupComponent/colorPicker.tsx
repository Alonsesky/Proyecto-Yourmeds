import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type ColorOption = { key: string; hex: string; label?: string };

type Props = {
  value: string;                         // hex seleccionado
  onChange: (hex: string) => void;       // callback al seleccionar
  options: ColorOption[];                // lista de colores
  label?: string;                        // texto del botón (default: "Color")
};

export default function ColorPicker({ value, onChange, options, label = 'Color' }: Props) {
  const [open, setOpen] = React.useState(false);

  const select = (hex: string) => {
    onChange(hex);
    setOpen(false);
  };

  return (
    <PickerWrap>
      <ColorPill onPress={() => setOpen(v => !v)} activeOpacity={0.9}>
        <ColorText>{label}</ColorText>
        <Spacer w={6} />
        <SwatchPreview style={{ backgroundColor: value }} />
        <Spacer w={6} />
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={WHITE} />
      </ColorPill>

      {open && (
        <Dropdown>
          <Swatches>
            {options.map(c => (
              <Dot
                key={c.key}
                style={{
                  backgroundColor: c.hex,
                  borderWidth: value === c.hex ? 2 : 0,
                  borderColor: WHITE,
                }}
                onPress={() => select(c.hex)}
              />
            ))}
          </Swatches>
        </Dropdown>
      )}
    </PickerWrap>
  );
}

/* ===== estilos ===== */
const PickerWrap = styled.View({
  position: 'relative',
});
const ColorPill = styled.TouchableOpacity({
  height: 40,
  borderRadius: 20,
  paddingHorizontal: 12,
  backgroundColor: BLUE,
  flexDirection: 'row',
  alignItems: 'center',
});
const ColorText = styled.Text({
  color: WHITE,
  fontWeight: '800',
  fontSize: 13,
});
const SwatchPreview = styled.View({
  width: 16,
  height: 16,
  borderRadius: 8,
});
const Dropdown = styled.View({
  position: 'absolute',
  top: 44,
  right: 0,
  backgroundColor: BLUE,
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 16,
  zIndex: 100,
  elevation: 6, // Android
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
});
const Swatches = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});
const Dot = styled.TouchableOpacity({
  width: 18,
  height: 18,
  borderRadius: 9,
});
const Spacer = ({ w = 0, h = 0 }: { w?: number; h?: number }) => <SpacerBox style={{ width: w, height: h }} />;
const SpacerBox = styled.View({});

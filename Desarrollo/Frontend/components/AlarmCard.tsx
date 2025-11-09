import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

type Props = {
  groupLabel?: string;
  count: number;
  statusText: string;
  onPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;

  /** Nuevo: color de fondo/tinte del card y la cinta */
  tint?: string;            // ej: "#FF9800"
  /** Opcional: cambia texto/iconos a oscuro si el tinte es muy claro */
  autoContrast?: boolean;   // default: false (para no alterar tu look actual)
};

/* helpers mínimos */
const normalizeHex = (c?: string | null) =>
  c && /^#[0-9A-Fa-f]{6}$/.test(c.trim()) ? c.trim() : null;

const isLight = (hex: string) => {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  const y = 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
  return y > 0.7;
};

export default function AlarmCard({
  groupLabel = 'GRUPO PERSONAL',
  count,
  statusText,
  onPress,
  rightIcon = 'chevron-down',
  tint,
  autoContrast = false,
}: Props) {
  const bg = normalizeHex(tint) ?? BLUE;

  // Por defecto mantenemos todo en blanco (mismo look que antes).
  // Si activas autoContrast y el bg es claro, usa texto/iconos oscuros.
  const useDark = autoContrast && isLight(bg);
  const FG = useDark ? '#0A2540' : WHITE;
  const DIV = useDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.75)';

  return (
    <Wrapper onPress={onPress} activeOpacity={0.9} $bg={bg}>
      {/* ===== CINTA SUPERIOR ===== */}
      <RibbonWrap>
        <RibbonSVG width={130} height={26} viewBox="0 0 130 26">
          {/*Modificación de barra Grupo Personal*/}
          <Path
            d="
              M 0 10
              Q 7 0 15 -5
              H 100
              Q 112 0 120 14
              L 108 26
              H 18
              Q 6 26 0 14
              Z
            "
            fill={bg}
          />
        </RibbonSVG>

        <RibbonText numberOfLines={1} style={{ color: useDark ? '#13314F' : '#E6F4FF' }}>
          {groupLabel}
        </RibbonText>
      </RibbonWrap>

      {/* ===== CONTENIDO TARJETA ===== */}
      <Row>
        <Left>
          <Ionicons name="person-circle" size={36} color={FG} />
          <CountText style={{ color: FG }}>{count}</CountText>
        </Left>

        <Divider style={{ backgroundColor: DIV }} />

        <Middle>
          <Ionicons
            name="medkit-outline"
            size={18}
            color={FG}
            style={{ marginRight: 8 }}
          />
          <StatusText numberOfLines={1} style={{ color: FG }}>
            {statusText}
          </StatusText>
        </Middle>

        <Right>
          <Ionicons name={rightIcon} size={28} color={FG} />
        </Right>
      </Row>
    </Wrapper>
  );
}

/* ================= estilos ================= */

const Wrapper = styled.TouchableOpacity<{ $bg: string }>({
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginHorizontal: 16,
  // sombra cross-platform
  shadowColor: '#000',
  shadowOpacity: 0.18,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 6,
  // para que la cinta pueda "salirse" sin ser cortada
  overflow: 'visible',
}, (p) => ({
  backgroundColor: p.$bg,
}));

const RibbonWrap = styled.View({
  position: 'absolute',
  top: -10,        // sobresale por arriba como en el mock
  left: 18,
  height: 26,
  justifyContent: 'center',
});

const RibbonSVG = styled(Svg)({
  position: 'absolute',
  left: 0,
  top: 0,
});

const RibbonText = styled.Text({
  // color dinámico arriba
  fontSize: 10,
  fontWeight: '700',
  letterSpacing: 0.6,
  marginLeft: 10,  // para que no choque con el borde curvo
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const Left = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const CountText = styled.Text({
  // color dinámico arriba
  fontSize: 28,
  fontWeight: '800',
  marginLeft: 8,
});

const Divider = styled.View({
  width: 1,
  height: 40, // un poquito más alto como en el mock
  // color dinámico arriba
  marginHorizontal: 16,
});

const Middle = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
});

const StatusText = styled.Text({
  // color dinámico arriba
  fontSize: 14,
  fontWeight: '700',
});

const Right = styled.View({});

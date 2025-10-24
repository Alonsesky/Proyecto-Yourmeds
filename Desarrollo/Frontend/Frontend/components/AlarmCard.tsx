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
};

export default function AlarmCard({
  groupLabel = 'GRUPO PERSONAL',
  count,
  statusText,
  onPress,
  rightIcon = 'chevron-down',
}: Props) {
  return (
    <Wrapper onPress={onPress} activeOpacity={0.9}>
      {/* ===== CINTA SUPERIOR ===== */}
      <RibbonWrap>
        {/* Ajusta width/height si quieres el pico más corto/largo */}
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
            fill={BLUE}
          />
        </RibbonSVG>

        <RibbonText numberOfLines={1}>{groupLabel}</RibbonText>
      </RibbonWrap>

      {/* ===== CONTENIDO TARJETA ===== */}
      <Row>
        <Left>
          <Ionicons name="person-circle" size={36} color={WHITE} />
          <CountText>{count}</CountText>
        </Left>

        <Divider />

        <Middle>
          <Ionicons
            name="medkit-outline"
            size={18}
            color={WHITE}
            style={{ marginRight: 8 }}
          />
          <StatusText numberOfLines={1}>{statusText}</StatusText>
        </Middle>

        <Right>
          <Ionicons name={rightIcon} size={28} color={WHITE} />
        </Right>
      </Row>
    </Wrapper>
  );
}

/* ================= estilos ================= */

const Wrapper = styled.TouchableOpacity({
  backgroundColor: BLUE,
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
});

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
  color: '#E6F4FF',
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
  color: WHITE,
  fontSize: 28,
  fontWeight: '800',
  marginLeft: 8,
});

const Divider = styled.View({
  width: 1,
  height: 40, // un poquito más alto como en el mock
  backgroundColor: 'rgba(255,255,255,0.75)',
  marginHorizontal: 16,
});

const Middle = styled.View({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
});

const StatusText = styled.Text({
  color: WHITE,
  fontSize: 14,
  fontWeight: '700',
});

const Right = styled.View({});

// components/uiError/errorDesing.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  details?: string;          // opcional: texto largo/JSON
  onClose: () => void;
  primaryLabel?: string;     // default: "OK"
  onPrimary?: () => void;    // default: onClose
};

const BLUE = '#0693E9';

export default function ErrorDialog({
  visible,
  title = 'Error',
  message,
  details,
  onClose,
  primaryLabel = 'OK',
  onPrimary,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Backdrop activeOpacity={1} onPress={onClose}>
        {/* evitar que el tap en la tarjeta cierre el modal */}
        <Card activeOpacity={1} onPress={() => {}}>
          <HeaderRow>
            <IconWrap>
              <Ionicons name="alert-circle" size={28} color="#fff" />
            </IconWrap>
            <Title>{title}</Title>
          </HeaderRow>

          {/* USAR el mensaje que llega por props */}
          <Message>{message}</Message>

          {/* Detalle opcional */}
          {details ? (
            <DetailsBox>
              <DetailsText numberOfLines={8}>{details}</DetailsText>
            </DetailsBox>
          ) : null}

          <ButtonsRow>
            <PrimaryBtn onPress={onPrimary ?? onClose}>
              <PrimaryText>{primaryLabel}</PrimaryText>
            </PrimaryBtn>
          </ButtonsRow>
        </Card>
      </Backdrop>
    </Modal>
  );
}

/* ===== estilos ===== */
const Backdrop = styled(TouchableOpacity)({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.55)',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 24,
});

const Card = styled(TouchableOpacity)({
  width: '100%',
  maxWidth: 420,
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 18,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 8,
});

const HeaderRow = styled(View)({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  gap: 10,
});

const IconWrap = styled(View)({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
});

const Title = styled.Text({
  fontSize: 18,
  fontWeight: '900',
  color: '#1b1b1b',
});

const Message = styled.Text({
  marginTop: 6,
  fontSize: 15,
  color: '#333',
});

const DetailsBox = styled(View)({
  marginTop: 10,
  backgroundColor: '#F7F9FC',
  borderRadius: 10,
  padding: 10,
  borderWidth: 1,
  borderColor: '#E7EEF6',
});

const DetailsText = styled.Text({
  fontFamily: 'monospace',
  fontSize: 12,
  color: '#556',
});

const ButtonsRow = styled(View)({
  marginTop: 14,
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

const PrimaryBtn = styled(TouchableOpacity)({
  backgroundColor: BLUE,
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 12,
});

const PrimaryText = styled.Text({
  color: '#fff',
  fontWeight: '900',
  letterSpacing: 0.3,
});

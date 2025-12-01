// components/groupComponent/leaveGroup.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

type Props = {
  visible: boolean;
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function LeaveGroupConfirmModal({
  visible,
  groupName,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  // Muestra exactamente lo que llega, y si viene vacío usa "Grupo"
  const displayName = (groupName ?? '').trim() || 'Grupo';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Backdrop onPress={loading ? undefined : onCancel} />

      <CardContainer>
        <HeaderRow>
          <Title>¿Está seguro de salir del grupo?</Title>
          <CloseBtn onPress={loading ? undefined : onCancel}>
            <CloseText>✕</CloseText>
          </CloseBtn>
        </HeaderRow>

        <BottomNote>Presione para confirmar</BottomNote>

        <ConfirmPressable onPress={loading ? undefined : onConfirm} disabled={loading}>
          <ExitWrapper>
            {loading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Ionicons name="log-out-outline" size={26} color={WHITE} />
            )}
          </ExitWrapper>
        </ConfirmPressable>
      </CardContainer>
    </Modal>
  );
}

/* ===== estilos ===== */
const Backdrop = styled.Pressable({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
});

const CardContainer = styled.View({
  position: 'absolute',
  left: 24,
  right: 24,
  top: '30%',
  backgroundColor: BLUE,
  borderRadius: 18,
  paddingHorizontal: 18,
  paddingTop: 18,   // un poco más de padding arriba
  paddingBottom: 22,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
});

const HeaderRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // centramos el título
  paddingRight: 40,         // espacio para la X
});

const Title = styled.Text({
  color: WHITE,
  fontWeight: '900',
  fontSize: 16,
  lineHeight: 22,
  textAlign: 'center',
});

const CloseBtn = styled.Pressable({
  position: 'absolute',
  right: 6,
  top: 2,
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.15)',
});

const CloseText = styled.Text({
  color: WHITE,
  fontSize: 16,
  fontWeight: 'bold',
});

const PillRow = styled.View({
  marginTop: 16,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  alignSelf: 'center',
});

const GroupName = styled.Text({
  color: WHITE,
  fontFamily: 'Oswald-Bold',
  fontSize: 26,
  letterSpacing: 1,
});

const BottomNote = styled.Text({
  marginTop: 16,
  textAlign: 'center',
  color: WHITE,
  fontWeight: '700',
});

const ConfirmPressable = styled(Pressable)({
  alignSelf: 'center',
  marginTop: 10,
});

const ExitWrapper = styled.View({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: '#0079C7',
  alignItems: 'center',
  justifyContent: 'center',
});

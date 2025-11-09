import React from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const SesionCloseModal: React.FC<Props> = ({ visible, onCancel, onConfirm, loading }) => {
  if (!visible) return null;

  return (
    <Wrap>
      <Dim />
      <Dialog>
        <DialogText>¿Esta seguro de cerrar sesión?</DialogText>

        <ButtonsRow>
          <Btn onPress={onConfirm} disabled={loading}>
            <BtnText>Sí, cerrar sesión</BtnText>
          </Btn>

          <Btn onPress={onCancel} disabled={loading}>
            <BtnText>Mantenerme</BtnText>
          </Btn>
        </ButtonsRow>
      </Dialog>
    </Wrap>
  );
};

export default SesionCloseModal;

/* ================= styled ================= */

const Wrap = styled.View({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 60,
  alignItems: 'center',
  justifyContent: 'center',
});

const Dim = styled.View({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.55)',
});

const Dialog = styled.View({
  width: Math.min(SCREEN_W - 28, 520),
  backgroundColor: BLUE,
  borderRadius: 16,
  paddingVertical: 18,
  paddingHorizontal: 16,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 12,
});

const DialogText = styled(Text)({
  color: WHITE,
  fontWeight: '900',
  fontSize: 16,
  textAlign: 'center',
});

const ButtonsRow = styled.View({
  width: '100%',
  marginTop: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
});

const Btn = styled(TouchableOpacity)({
  flex: 1,
  backgroundColor: WHITE,
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
});

const BtnText = styled(Text)({
  color: BLUE,
  fontWeight: '900',
});

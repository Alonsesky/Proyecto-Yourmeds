import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (type: 'alarm' | 'group') => void;
};

const BLUE = '#0693E9';

export default function AddChooser({ visible, onClose, onPick }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BackDrop activeOpacity={1} onPress={onClose}>
        <Card activeOpacity={1}>
          <HeaderRow>
            <Title>¿QUÉ QUIERE AGREGAR?</Title>
            <CloseBtn onPress={onClose}>
              <Ionicons name="close" size={26} color={BLUE} />
            </CloseBtn>
          </HeaderRow>

          <OptionsRow>
            <Option onPress={() => onPick('alarm')}>
              <Ionicons name="alarm" size={46} color="#fff" />
              <OptionLabel>ALARMA</OptionLabel>
            </Option>

            <Option onPress={() => onPick('group')}>
              <Ionicons name="people" size={46} color="#fff" />
              <OptionLabel>GRUPO</OptionLabel>
            </Option>
          </OptionsRow>
        </Card>
      </BackDrop>
    </Modal>
  );
}

/* ======= estilos ======= */

const BackDrop = styled.TouchableOpacity({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 18,
});

const Card = styled(TouchableOpacity)({
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 20,
  paddingVertical: 16,
  paddingHorizontal: 16,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 10,
});

const HeaderRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
});

const Title = styled.Text({
  color: BLUE,
  fontSize: 16,
  fontWeight: '900',
  letterSpacing: 0.6,
});

const CloseBtn = styled.TouchableOpacity({
  padding: 6,
  borderRadius: 10,
});

const OptionsRow = styled.View({
  flexDirection: 'row',
  gap: 14,
  justifyContent: 'space-between',
});

const Option = styled.TouchableOpacity({
  flex: 1,
  backgroundColor: BLUE,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 22,
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
});

const OptionLabel = styled.Text({
  marginTop: 8,
  color: '#fff',
  fontWeight: '800',
  letterSpacing: 0.5,
});

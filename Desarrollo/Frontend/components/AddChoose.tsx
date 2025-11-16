// components/AddChoose.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (type: 'alarm' | 'group') => void;
  canAddAlarm?: boolean; // NUEVO
};

const BLUE = '#0693E9';

const AddChooser: React.FC<Props> = ({
  visible,
  onClose,
  onPick,
  canAddAlarm = true,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Overlay>
        <Card>
          <HeaderRow>
            <Title>¿QUÉ QUIERE AGREGAR?</Title>
            <CloseBtn onPress={onClose}>
              <Ionicons name="close" size={22} color={BLUE} />
            </CloseBtn>
          </HeaderRow>

          <ButtonsRow>
            {/* Botón ALARMA */}
            <ChoiceButton
              disabled={!canAddAlarm}
              activeOpacity={canAddAlarm ? 0.7 : 1}
              onPress={() => {
                if (!canAddAlarm) return;
                onPick('alarm');
              }}
              style={!canAddAlarm && { opacity: 0.4 }} // visualmente deshabilitado
            >
              <Ionicons name="alarm-outline" size={40} color="#fff" />
              <ChoiceText>ALARMA</ChoiceText>
              {!canAddAlarm && (
                <HintText>Primero crea un grupo</HintText>
              )}
            </ChoiceButton>

            {/* Botón GRUPO */}
            <ChoiceButton
              onPress={() => onPick('group')}
              activeOpacity={0.7}
            >
              <Ionicons name="people-outline" size={40} color="#fff" />
              <ChoiceText>GRUPO</ChoiceText>
            </ChoiceButton>
          </ButtonsRow>
        </Card>
      </Overlay>
    </Modal>
  );
};

export default AddChooser;

// =======================
// Estilos
// =======================
const Overlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
});

const Card = styled.View({
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 24,
  paddingVertical: 18,
  paddingHorizontal: 18,
});

const HeaderRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
});

const Title = styled.Text({
  fontSize: 16,
  fontWeight: '700',
  color: BLUE,
});

const CloseBtn = styled(TouchableOpacity)({
  padding: 4,
});

const ButtonsRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ChoiceButton = styled(TouchableOpacity)({
  flex: 1,
  backgroundColor: BLUE,
  borderRadius: 18,
  paddingVertical: 18,
  marginHorizontal: 4,
  alignItems: 'center',
  justifyContent: 'center',
});

const ChoiceText = styled.Text({
  color: '#fff',
  fontWeight: '700',
  fontSize: 14,
  marginTop: 8,
});

const HintText = styled.Text({
  marginTop: 4,
  color: '#fff',
  fontSize: 10,
  textAlign: 'center',
  opacity: 0.9,
});

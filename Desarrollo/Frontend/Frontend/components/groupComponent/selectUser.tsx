import React from 'react';
import styled from 'styled-components/native';

type Props = {
  email: string;
  onEmailChange: (v: string) => void;
  onAddPress: () => void;
};

export default function SelectUser({ email, onEmailChange, onAddPress }: Props) {
  return (
    <Wrap>
      <Label>AGREGAR USUARIO</Label>
      <Row>
        <Input
          value={email}
          onChangeText={onEmailChange}
          placeholder="Correo del usuario"
          placeholderTextColor="#E6F4FF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AddBtn onPress={onAddPress} activeOpacity={0.9}>
          <AddText>Agregar</AddText>
        </AddBtn>
      </Row>
    </Wrap>
  );
}

const Wrap = styled.View({
  marginTop: 12,
  paddingHorizontal: 21,
});

const Label = styled.Text({
  color: '#0693E9',
  fontSize: 14,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 1,
});

const Row = styled.View({
  marginTop: 8,
  flexDirection: 'row',
  gap: 8,
});

const Input = styled.TextInput({
  flex: 1,
  backgroundColor: '#0693E9',
  borderRadius: 24,
  paddingVertical: 10,
  paddingHorizontal: 16,
  color: '#FFFFFF',
  fontWeight: '800',
  fontSize: 14,
});

const AddBtn = styled.TouchableOpacity({
  height: 44,
  borderRadius: 16,
  paddingHorizontal: 14,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#0693E9',
});

const AddText = styled.Text({
  color: '#FFFFFF',
  fontWeight: '800',
});
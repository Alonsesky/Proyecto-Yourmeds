// app/(group)/group.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';

import ListUsers, { UserRow } from '@/components/groupComponent/listUser';
import ColorPicker from '../../components/groupComponent/colorPicker';
import SelectUser from '../../components/groupComponent/selectUser';


const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

const COLOR_OPTIONS = [
  { key: 'blue',   hex: '#0693E9', label: 'Azul' },
  { key: 'cyan',   hex: '#00BCD4', label: 'Cyan' },
  { key: 'teal',   hex: '#009688', label: 'Teal' },
  { key: 'green',  hex: '#4CAF50', label: 'Verde' },
  { key: 'lime',   hex: '#CDDC39', label: 'Lima' },
  { key: 'amber',  hex: '#FFC107', label: 'Ámbar' },
  { key: 'orange', hex: '#FF9800', label: 'Naranjo' },
  { key: 'red',    hex: '#F44336', label: 'Rojo' },
];

export default function GroupScreen() {
  const router = useRouter();

  // Estado del formulario
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState<string>(COLOR_OPTIONS[0].hex);

  // Agregar usuario (solo correo en esta pantalla)
  const [emailTmp, setEmailTmp] = useState('');

  // Lista de usuarios (usa tu flujo real; aquí hay demo)
  const [users, setUsers] = useState<UserRow[]>([
    { id: '1', email: 'cr@gmail.com', role: 'editor' },
    { id: '2', email: 'al@gmail.com', role: 'lector' },
    { id: '3', email: 'br@gmail.com', role: 'lector' },
  ]);

  const handleAddUser = () => {
    const email = emailTmp.trim();
    if (!email) return;
    setUsers((arr) => [
      ...arr,
      { id: String(Date.now()), email, role: 'lector' }, // rol por defecto
    ]);
    setEmailTmp('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers((arr) => arr.filter((u) => u.id !== id));
  };

  const handleConfirm = () => {
    // Aquí arma el payload para tu API
    // const payload = {
    //   name: groupName.trim(),
    //   color: groupColor,
    //   users: users.map(u => ({ email: u.email, role: u.role })),
    // };
    // await api.post('/groups', payload);
    router.back();
  };

  return (
    <Screen>
      <Safe style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* Header */}
        <Header>
          <HeaderTitle>NUEVO GRUPO</HeaderTitle>
          <CloseBtn onPress={() => router.back()} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={40} color={BLUE} />
          </CloseBtn>
        </Header>

        {/* Nombre + Color */}
        <Section style={{ paddingHorizontal: 21 }}>
          <FieldLabel>NOMBRE GRUPO</FieldLabel>

          <Row>
            <NamePill>
              <NameInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Escribir Nombre"
                placeholderTextColor="#E6F4FF"
                autoCapitalize="sentences"
                returnKeyType="done"
                blurOnSubmit
                maxLength={60}
              />
            </NamePill>

            <ColorPicker
              value={groupColor}
              onChange={setGroupColor}
              options={COLOR_OPTIONS}
            />
          </Row>
        </Section>

        {/* Agregar usuario */}
        <SelectUser
          email={emailTmp}
          onEmailChange={setEmailTmp}
          onAddPress={handleAddUser}
          showRole={false} // ocultamos el selector de rol aquí
        />

        {/* Lista de usuarios */}
        <Section style={{ paddingHorizontal: 21, marginTop: 16 }}>
          <FieldLabel>LISTA DE USUARIOS</FieldLabel>
          <UsersBox>
            <ListUsers items={users} onDelete={handleDeleteUser} />
          </UsersBox>
        </Section>

        <Spacer h={20} />
      </Safe>

      {/* Botón confirmar (fijo abajo) */}
      <Footer>
        <ConfirmBtn onPress={handleConfirm} activeOpacity={0.9}>
          <ConfirmText>CONFIRMAR</ConfirmText>
          <Ionicons name="checkmark" size={22} color={WHITE} />
        </ConfirmBtn>
      </Footer>
    </Screen>
  );
}

/* =============== estilos =============== */
const Screen = styled.View({
  flex: 1,
  backgroundColor: WHITE,
});
const Safe = styled(SafeAreaView)({ flex: 1 });

const Header = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
});
const HeaderTitle = styled.Text({
  fontSize: 28,
  color: BLUE,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 1,
  textTransform: 'uppercase',
});
const CloseBtn = styled.TouchableOpacity({
  padding: 6,
  borderRadius: 10,
});

const Section = styled.View({
  marginTop: 8,
});
const FieldLabel = styled.Text({
  color: BLUE,
  fontSize: 14,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 1,
});

const Row = styled.View({
  marginTop: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const NamePill = styled.View({
  flex: 1,
  backgroundColor: BLUE,
  borderRadius: 24,
  paddingVertical: 10,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
});
const NameInput = styled.TextInput({
  flex: 1,
  color: WHITE,
  fontWeight: '800',
  fontSize: 14,
  paddingVertical: 6,
});

const UsersBox = styled.View({
  marginTop: 8,
  backgroundColor: BLUE,
  borderRadius: 22,
  padding: 10,
});

const Footer = styled.View({
  paddingHorizontal: 21,
  paddingBottom: 16,
});
const ConfirmBtn = styled.TouchableOpacity({
  height: 54,
  borderRadius: 16,
  backgroundColor: BLUE,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
});
const ConfirmText = styled.Text({
  color: WHITE,
  fontSize: 18,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const Spacer = ({ w = 0, h = 0 }: { w?: number; h?: number }) => (
  <SpacerBox style={{ width: w, height: h }} />
);
const SpacerBox = styled.View({});

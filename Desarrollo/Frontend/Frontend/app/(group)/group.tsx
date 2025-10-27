// app/(group)/group.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, SafeAreaView, StatusBar } from 'react-native';
import styled from 'styled-components/native';

import ListUsers, { UserRow } from '@/components/groupComponent/listUser';
import SelectName from '@/components/groupComponent/selectName';
import SelectUser from '@/components/groupComponent/selectUser';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export default function NewGroupScreen() {
    const router = useRouter();
    const [groupName, setGroupName] = React.useState('');
    const [emailTmp, setEmailTmp] = React.useState('');
    const [roleTmp, setRoleTmp] = React.useState<'editor'|'lector'>('editor');

    const [users, setUsers] = useState<UserRow[]>([
      { id: '1', email: 'cr@gmail.com', role: 'editor' },
      { id: '2', email: 'al@gmail.com', role: 'lector' },
      { id: '3', email: 'br@gmail.com', role: 'lector' },
    ]);

    const handleDelete = (id: string) =>
      setUsers((arr) => arr.filter((u) => u.id !== id));
    
  return (
    <Screen>
      <Safe style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        {/* ===== Cabecera ===== */}
        <HeaderBar>
          <HeaderTitle>NUEVO GRUPO</HeaderTitle>
          <CloseBtn onPress={() => router.back()} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={40} color={BLUE} />
          </CloseBtn>
        </HeaderBar>

        {/* NOMBRE GRUPO */}
        <SelectName value={groupName} onChange={setGroupName} />

        {/*Agrear Usuario*/}
        <SelectUser 
            email={emailTmp}
            role={roleTmp}
            onEmailChange={setEmailTmp}
            onRoleChange={setRoleTmp}
            onAddPress={() => {
                // más adelante: validar y añadir a la lista
                console.log('ADD user:', emailTmp, roleTmp);
            }}
            />

            <ListUsers items={users} onDelete={handleDelete} />
      </Safe>
    </Screen>
  );
}

/* ================== Estilos ================== */
const Screen = styled.View({
  flex: 1,
  backgroundColor: WHITE,
});

const Safe = styled(SafeAreaView)({
  paddingHorizontal: 18,
});

const HeaderBar = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingBottom: 8,
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

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import styled from 'styled-components/native';

import ColorPicker from '@/components/groupComponent/colorPicker';
import GroupTypePicker, {
  GroupTypeKey,
} from '@/components/groupComponent/groupTypePicker';
import ListUsers, { type UserRow } from '@/components/groupComponent/listUser';
import SelectUser from '@/components/groupComponent/selectUser';
import {
  addMembersToGroup,
  createGroup,
  getGroupById,
  listMembers,
  type MemberDto,
  updateGroup,
} from '../services/group';
import type {
  GroupCreateRequest,
  GroupResponse,
} from '../types/groupTypes';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

const COLOR_OPTIONS = [
  { key: 'blue', hex: '#0693E9', label: 'Azul' },
  { key: 'cyan', hex: '#00BCD4', label: 'Cyan' },
  { key: 'teal', hex: '#009688', label: 'Teal' },
  { key: 'green', hex: '#4CAF50', label: 'Verde' },
  { key: 'lime', hex: '#CDDC39', label: 'Lima' },
  { key: 'amber', hex: '#FFC107', label: 'Ámbar' },
  { key: 'orange', hex: '#FF9800', label: 'Naranjo' },
  { key: 'red', hex: '#F44336', label: 'Rojo' },
];

export default function GroupScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const isEditing = !!groupId;

  // Estado del formulario
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState<string>(COLOR_OPTIONS[0].hex);
  const [groupType, setGroupType] = useState<GroupTypeKey>('compartido');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);

  // Campo para agregar usuario (correo)
  const [emailTmp, setEmailTmp] = useState('');

  // Lista de usuarios a mostrar / invitar
  const [users, setUsers] = useState<UserRow[]>([]);

  // ================== CARGA INICIAL EN MODO EDICIÓN ==================
  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      try {
        setInitialLoading(true);

        // 1) Datos del grupo
        const data: GroupResponse = await getGroupById(groupId!);
        setGroupName(data.name ?? '');
        setGroupColor(data.color ?? COLOR_OPTIONS[0].hex);
        setGroupType(data.is_private ? 'privado' : 'compartido');

        // 2) Miembros del grupo → llenar lista
        try {
          const members: MemberDto[] = await listMembers(groupId!);

          const mapped: UserRow[] = members.map((m) => ({
            id: String(m.id),
            email: (m as any).email ?? '',
            name: (m as any).name ?? '',
            // 👇 aquí agregamos todos los posibles nombres de campo
            last_name:
              (m as any).last_name ??
              (m as any).lastName ??
              (m as any).lastname ??
              '',
            isOwner: !!(m as any).isOwner,
          }));

          setUsers(mapped);
        } catch (e) {
          console.warn('No se pudieron cargar los miembros del grupo', e);
          setUsers([]);
        }

        setEmailTmp('');
      } catch (e: any) {
        Alert.alert(
          'Error',
          e?.message || 'No se pudo cargar la información del grupo.'
        );
        router.back();
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [groupId, isEditing, router]);

  // ================== MANEJO DE USUARIOS ==================
  const handleAddUser = () => {
    const email = emailTmp.trim();
    if (!email) return;

    setUsers((prev: UserRow[]) => {
      if (
        prev.some(
          (item: UserRow) =>
            item.email.toLowerCase() === email.toLowerCase()
        )
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          id: String(Date.now()),
          email,
          name: '',
          last_name: '',
          isOwner: false,
        },
      ];
    });

    setEmailTmp('');
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev: UserRow[]) =>
      prev.filter((item: UserRow) => item.id !== id)
    );
  };

  // ================== CONFIRMAR (CREAR / EDITAR) ==================
  const handleConfirm = async () => {
    if (!groupName.trim()) {
      Alert.alert('Faltan datos', 'El nombre del grupo es obligatorio.');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(groupColor)) {
      Alert.alert('Color inválido', 'Usa formato HEX #RRGGBB.');
      return;
    }

    try {
      setLoading(true);

      const req: GroupCreateRequest = {
        name: groupName.trim(),
        color: groupColor.trim(),
        is_private: groupType === 'privado',
      };

      let finalGroupId: number;

      if (isEditing) {
        // actualizar grupo existente
        const updated: GroupResponse = await updateGroup(groupId!, req);
        const raw =
          (updated as any).id ??
          (updated as any).group_id ??
          groupId;
        finalGroupId = Number(raw);
      } else {
        // crear grupo nuevo
        const created: GroupResponse = await createGroup(req);
        const raw = (created as any).id ?? (created as any).group_id;
        const groupIdNum =
          typeof raw === 'string' ? Number(raw) : (raw as number | undefined);

        if (
          groupIdNum === undefined ||
          groupIdNum === null ||
          Number.isNaN(groupIdNum)
        ) {
          throw new Error('No se obtuvo el id del grupo');
        }
        finalGroupId = groupIdNum;
      }

      // Agregar usuarios si es compartido y hay correos
      let addedCount = 0;
      if (groupType === 'compartido' && users.length > 0) {
        const emails = users
          .map((u) => u.email)
          .filter((e) => e && e.trim().length > 0);

        if (emails.length > 0) {
          try {
            await addMembersToGroup(finalGroupId, emails);
            addedCount = emails.length;
          } catch (err) {
            console.error('Error al agregar usuarios:', err);
            Alert.alert(
              'Advertencia',
              isEditing
                ? 'El grupo se actualizó, pero algunos usuarios no se pudieron agregar.'
                : 'El grupo fue creado, pero no se pudieron agregar los usuarios.'
            );
          }
        }
      }

      const baseMsg = isEditing
        ? `Grupo "${req.name}" actualizado correctamente.`
        : `Grupo "${req.name}" creado correctamente.`;

      const membersMsg =
        groupType === 'compartido' && addedCount > 0
          ? ` Se agregaron ${addedCount} usuario(s).`
          : '';

      Alert.alert('¡Listo!', `${baseMsg}${membersMsg}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);

      if (!isEditing) {
        // sólo en creación
        setGroupName('');
        setGroupColor(COLOR_OPTIONS[0].hex);
        setEmailTmp('');
        if (groupType === 'compartido') setUsers([]);
      }
    } catch (e: any) {
      const msg =
        e?.message ||
        (isEditing
          ? 'No se pudo actualizar el grupo. Intenta nuevamente.'
          : 'No se pudo crear el grupo. Intenta nuevamente.');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ================== RENDER ==================
  if (initialLoading) {
    return (
      <LoaderWrap>
        <ActivityIndicator size="large" color={BLUE} />
      </LoaderWrap>
    );
  }

  const headerTitle = isEditing ? 'EDITAR GRUPO' : 'NUEVO GRUPO';
  const buttonLabel = isEditing ? 'GUARDAR CAMBIOS' : 'CONFIRMAR';
  const loadingLabel = isEditing ? 'Guardando...' : 'Creando...';

  return (
    <Screen>
      <Safe
        style={{
          paddingTop:
            Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}
      >
        {/* Header */}
        <Header>
          <HeaderTitle>{headerTitle}</HeaderTitle>
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

        {/* Tipo de grupo */}
        <Section style={{ paddingHorizontal: 21, marginTop: 12 }}>
          <FieldLabel>TIPO DE GRUPO</FieldLabel>
          <Row>
            <GroupTypePicker
              value={groupType}
              onChange={(next) => {
                setGroupType(next);
                if (next === 'privado') {
                  setUsers([]);
                  setEmailTmp('');
                }
              }}
            />
          </Row>
        </Section>

        {/* Solo si es compartido */}
        {groupType === 'compartido' && (
          <>
            <SelectUser
              email={emailTmp}
              onEmailChange={setEmailTmp}
              onAddPress={handleAddUser}
            />

            <Section style={{ paddingHorizontal: 21, marginTop: 16 }}>
              <FieldLabel>LISTA DE USUARIOS</FieldLabel>
              <UsersBox>
                <ListUsers items={users} onDelete={handleDeleteUser} />
              </UsersBox>
            </Section>

            <Spacer h={20} />
          </>
        )}
      </Safe>

      {/* Footer */}
      <Footer>
        <ConfirmBtn
          onPress={handleConfirm}
          activeOpacity={0.9}
          disabled={
            loading ||
            (!isEditing && groupType === 'compartido' && users.length === 0)
          }
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          <ConfirmText>{loading ? loadingLabel : buttonLabel}</ConfirmText>
          <Ionicons name="checkmark" size={22} color={WHITE} />
        </ConfirmBtn>
      </Footer>
    </Screen>
  );
}

/* =============== estilos =============== */
const Screen = styled.View({ flex: 1, backgroundColor: WHITE });
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
const CloseBtn = styled.TouchableOpacity({ padding: 6, borderRadius: 10 });

const Section = styled.View({ marginTop: 8 });
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

const Footer = styled.View({ paddingHorizontal: 21, paddingBottom: 16 });
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

const LoaderWrap = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: WHITE,
});

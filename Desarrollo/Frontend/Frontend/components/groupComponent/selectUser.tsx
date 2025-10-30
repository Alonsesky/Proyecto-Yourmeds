// components/SelectUser.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type GroupRole = 'editor' | 'lector';

type Props = {
  inset?: number;                // margen horizontal externo
  label?: string;                // "AGREGAR USUARIO"
  email?: string;                // controlado opcional
  role?: GroupRole;              // controlado opcional
  showRole?: boolean;            // ← mostrar/ocultar el picker de rol
  onEmailChange?: (v: string) => void;
  onRoleChange?: (r: GroupRole) => void;
  onAddPress?: () => void;
};

export default function SelectUser({
  inset = 21,
  label = 'AGREGAR USUARIO',
  email: emailProp,
  role: roleProp = 'lector',
  showRole = true,
  onEmailChange,
  onRoleChange,
  onAddPress,
}: Props) {
  // Estados internos cuando no vienen controlados
  const [email, setEmail] = React.useState(emailProp ?? '');
  const [role, setRole] = React.useState<GroupRole>(roleProp);

  // Sincroniza si cambian desde afuera
  React.useEffect(() => {
    if (emailProp !== undefined) setEmail(emailProp);
  }, [emailProp]);

  React.useEffect(() => {
    setRole(roleProp);
  }, [roleProp]);

  const changeEmail = (v: string) => {
    setEmail(v);
    onEmailChange?.(v);
  };

  const changeRole = (v: GroupRole) => {
    setRole(v);
    onRoleChange?.(v);
  };

  return (
    <Wrap style={{ paddingHorizontal: inset, marginTop: 16 }}>
      <FieldLabel>{label}</FieldLabel>

      <Row>
        {/* Correo */}
        <Pill style={{ flex: 1 }}>
          <EmailInput
            placeholder="Agregar correo"
            placeholderTextColor="#E6F4FF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={changeEmail}
          />
        </Pill>

        {/* Rol (se puede ocultar con showRole) */}
        {showRole && (
          <RolePill>
            <PickerStyled
              selectedValue={role}
              onValueChange={(v) => changeRole(v as GroupRole)}
              dropdownIconColor={WHITE}
            >
              <Picker.Item label="Editor" value="editor" />
              <Picker.Item label="Lector" value="lector" />
            </PickerStyled>
            <Chevron>
              <Ionicons name="chevron-down" size={16} color={WHITE} />
            </Chevron>
          </RolePill>
        )}

        {/* Botón agregar */}
        <CircleBtn onPress={onAddPress} activeOpacity={0.9}>
          <Ionicons name="person-add" size={20} color={BLUE} />
        </CircleBtn>
      </Row>
    </Wrap>
  );
}

/* ===== estilos ===== */
const Wrap = styled.View({});

const FieldLabel = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
});

const Pill = styled.View({
  backgroundColor: BLUE,
  borderRadius: 24,
  paddingVertical: 10,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
});

const EmailInput = styled.TextInput({
  flex: 1,
  color: WHITE,
  fontWeight: '800',
  fontSize: 14,
  paddingVertical: 6,
});

const RolePill = styled.View({
  backgroundColor: BLUE,
  borderRadius: 18,
  height: 36,
  minWidth: 110,
  paddingLeft: 10,
  paddingRight: 30, // espacio para el chevron
  justifyContent: 'center',
  position: 'relative',
});

const PickerStyled = styled(Picker)({
  color: WHITE,
  width: '100%',
  height: 36,
});

const Chevron = styled.View({
  position: 'absolute',
  right: 8,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
});

const CircleBtn = styled.TouchableOpacity({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: BLUE,
});
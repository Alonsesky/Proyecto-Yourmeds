import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import styled from 'styled-components/native';
import type { MeProfile } from '../../app/services/user';
import { updateMyProfile } from '../../app/services/user';

const BLUE = '#0693E9';
const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogoutPress: () => void;
  profile: MeProfile | null;
};

const getName = (p: MeProfile | null) =>
  (p?.name ?? 'USUARIO').toString().toUpperCase();

const getLastName = (p: MeProfile | null) =>
  (p?.last_name ?? '').toString().toUpperCase();

const getRut = (p: MeProfile | null) =>
  (p as any)?.rut ?? (p as any)?.dni ?? '—';

const getAge = (p: MeProfile | null) =>
  (p as any)?.age ?? (p as any)?.edad ?? null;

const getEmail = (p: MeProfile | null) =>
  p?.email ?? (p as any)?.mail ?? (p as any)?.username ?? '—';

export default function ProfileUser({
  visible,
  onClose,
  onLogoutPress,
  profile,
}: Props) {
  const router = useRouter();

  const [internalVisible, setInternalVisible] = useState(visible);
  const translateX = useRef(new Animated.Value(SCREEN_W)).current;

  const [isEditing, setIsEditing] = useState(false);

  // nuevos estados para nombre y apellido
  const [nameValue, setNameValue] = useState('');
  const [lastNameValue, setLastNameValue] = useState('');

  const [rutValue, setRutValue] = useState('');
  const [ageValue, setAgeValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Animación de slide
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: SCREEN_W,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible, translateX]);

  // Sincronizar campos al abrir
  useEffect(() => {
    if (!visible) return;

    const name = profile?.name ?? '';
    const lastName = profile?.last_name ?? '';
    const rut = getRut(profile);
    const age = getAge(profile);
    const email = getEmail(profile);

    setNameValue(String(name));
    setLastNameValue(String(lastName));
    setRutValue(rut === '—' ? '' : String(rut));
    setAgeValue(age != null ? String(age) : '');
    setEmailValue(email === '—' ? '' : email);
    setIsEditing(false);
  }, [visible, profile]);

  const name = getName(profile);
  const lastName = getLastName(profile);
  const rut = getRut(profile);
  const age = getAge(profile);
  const email = getEmail(profile);
  const fullName = `${name}${lastName ? ` ${lastName}` : ''}`;

  const handleClosePanel = () => {
    setIsEditing(false);
    onClose();
  };

  const startEdit = () => {
    setIsEditing(true);
  };

  // ----- handlers de inputs con restricciones -----
  const handleRutChange = (text: string) => {
    const numeric = text.replace(/\D/g, '');
    const trimmed = numeric.slice(0, 9);
    setRutValue(trimmed);
  };

  const handleAgeChange = (text: string) => {
    const numeric = text.replace(/\D/g, '');
    const trimmed = numeric.slice(0, 2);
    setAgeValue(trimmed);
  };
  // ------------------------------------------------

  const handleCancelEdit = () => {
    const nameOrig = profile?.name ?? '';
    const lastOrig = profile?.last_name ?? '';
    const rutOrig = getRut(profile);
    const ageOrig = getAge(profile);
    const emailOrig = getEmail(profile);

    setNameValue(String(nameOrig));
    setLastNameValue(String(lastOrig));
    setRutValue(rutOrig === '—' ? '' : String(rutOrig));
    setAgeValue(ageOrig != null ? String(ageOrig) : '');
    setEmailValue(emailOrig === '—' ? '' : emailOrig);

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (saving) return;

    // NOMBRE y APELLIDO obligatorios
    const trimmedName = nameValue.trim();
    const trimmedLast = lastNameValue.trim();

    if (!trimmedName) {
      Alert.alert('Nombre requerido', 'Ingresa tu nombre.');
      return;
    }
    if (!trimmedLast) {
      Alert.alert('Apellido requerido', 'Ingresa tu apellido.');
      return;
    }

    // Validación RUT (si viene)
    if (rutValue.trim() !== '') {
      if (!/^\d+$/.test(rutValue)) {
        Alert.alert('RUT inválido', 'El RUT solo debe contener números.');
        return;
      }
      if (rutValue.length < 8 || rutValue.length > 9) {
        Alert.alert(
          'RUT inválido',
          'El RUT debe tener entre 8 y 9 dígitos numéricos.'
        );
        return;
      }
    }

    // EDAD obligatoria 16–99
    if (ageValue.trim() === '') {
      Alert.alert('Edad requerida', 'La edad debe estar entre 16 y 99 años.');
      return;
    }
    const n = Number(ageValue);
    if (Number.isNaN(n) || n < 16 || n > 99) {
      Alert.alert('Edad inválida', 'La edad debe estar entre 16 y 99 años.');
      return;
    }
    const parsedAge = n;

    // EMAIL obligatorio
    if (!emailValue.trim()) {
      Alert.alert('Correo requerido', 'Ingresa un correo electrónico válido.');
      return;
    }

    const payload = {
      name: trimmedName,
      last_name: trimmedLast,
      rut: rutValue.trim() === '' ? null : rutValue.trim(),
      age: parsedAge,
      email: emailValue.trim(),
    };

    try {
      setSaving(true);
      const updated = await updateMyProfile(payload);

      setNameValue(updated.name ?? trimmedName);
      setLastNameValue(updated.last_name ?? trimmedLast);
      setRutValue(updated.rut ? String(updated.rut) : '');
      setAgeValue(
        updated.age != null ? String(updated.age) : String(parsedAge)
      );
      setEmailValue(updated.email ?? emailValue.trim());

      Alert.alert(
        'Cambios guardados',
        'Los datos de tu perfil se han actualizado.'
      );
      setIsEditing(false);
    } catch (e: any) {
      console.error('Error al actualizar perfil:', e);
      Alert.alert(
        'Error',
        e?.message || 'No se pudo actualizar tu perfil. Intenta nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    handleClosePanel();
    onLogoutPress();
  };

  const handleOpenHelp = () => {
    // Cerramos el panel antes de navegar
    setIsEditing(false);
    onClose();
    router.push('/help');
  };

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClosePanel}
    >
      <TouchableWithoutFeedback onPress={handleClosePanel}>
        <Overlay>
          <Animated.View
            style={{
              width: '78%',
              height: '100%',
              transform: [{ translateX }],
            }}
          >
            <SidePanel
              style={{
                paddingTop:
                  Platform.OS === 'android'
                    ? (StatusBar.currentHeight ?? 0) + 8
                    : 20,
              }}
            >
              <HeaderRow>
                <BackBtn onPress={handleClosePanel}>
                  <Ionicons name="arrow-back-outline" size={26} color={BLUE} />
                </BackBtn>
              </HeaderRow>

              <ContentWrap>
                <ProfileCard>
                  <AvatarCircle>
                    <Ionicons name="person-outline" size={52} color={BLUE} />
                  </AvatarCircle>

                  <EditBtn onPress={startEdit}>
                    <Ionicons name="create-outline" size={22} color={BLUE} />
                  </EditBtn>

                  {/* Nombre + Apellido */}
                  {!isEditing ? (
                    <NamePill>
                      <NamePillText>{fullName}</NamePillText>
                    </NamePill>
                  ) : (
                    <NameEditRow>
                      <NameInput
                        value={nameValue}
                        onChangeText={setNameValue}
                        placeholder="Nombre"
                        autoCapitalize="words"
                      />
                      <NameInput
                        value={lastNameValue}
                        onChangeText={setLastNameValue}
                        placeholder="Apellido"
                        autoCapitalize="words"
                      />
                    </NameEditRow>
                  )}

                  {/* RUT */}
                  <InfoRow>
                    <InfoIconBox>
                      <Ionicons name="card-outline" size={20} color={BLUE} />
                    </InfoIconBox>
                    <InfoTextWrap>
                      <InfoLabel>RUT</InfoLabel>
                      {isEditing ? (
                        <InfoInput
                          value={rutValue}
                          onChangeText={handleRutChange}
                          placeholder="Ingresa tu RUT"
                          keyboardType="numeric"
                          maxLength={9}
                        />
                      ) : (
                        <InfoValue>{rut}</InfoValue>
                      )}
                    </InfoTextWrap>
                  </InfoRow>

                  {/* EDAD */}
                  <InfoRow>
                    <InfoIconBox>
                      <Ionicons name="calendar-outline" size={20} color={BLUE} />
                    </InfoIconBox>
                    <InfoTextWrap>
                      <InfoLabel>EDAD</InfoLabel>
                      {isEditing ? (
                        <InfoInput
                          value={ageValue}
                          onChangeText={handleAgeChange}
                          placeholder="Ingresa tu edad"
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      ) : (
                        <InfoValue>
                          {age != null ? `${age} AÑOS` : '—'}
                        </InfoValue>
                      )}
                    </InfoTextWrap>
                  </InfoRow>

                  {/* EMAIL */}
                  <InfoRow>
                    <InfoIconBox>
                      <Ionicons name="mail-outline" size={20} color={BLUE} />
                    </InfoIconBox>
                    <InfoTextWrap>
                      <InfoLabel>EMAIL</InfoLabel>
                      {isEditing ? (
                        <InfoInput
                          value={emailValue}
                          onChangeText={setEmailValue}
                          placeholder="Ingresa tu correo"
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      ) : (
                        <InfoValue>{email}</InfoValue>
                      )}
                    </InfoTextWrap>
                  </InfoRow>
                </ProfileCard>

                <BottomActions>
                  <LogoutDivider />
                  {!isEditing ? (
                    <>
                      {/* Botón de ayuda */}
                      <LogoutBtn onPress={handleOpenHelp}>
                        <Ionicons
                          name="help-circle-outline"
                          size={22}
                          color={BLUE}
                        />
                        <LogoutText>CENTRO DE AYUDA</LogoutText>
                      </LogoutBtn>

                      {/* Botón de cerrar sesión */}
                      <LogoutBtn onPress={handleLogout}>
                        <Ionicons
                          name="log-out-outline"
                          size={22}
                          color={BLUE}
                        />
                        <LogoutText>CERRAR SESIÓN</LogoutText>
                      </LogoutBtn>
                    </>
                  ) : (
                    <ActionsRow>
                      <SecondaryBtn
                        onPress={handleCancelEdit}
                        disabled={saving}
                      >
                        <SecondaryText>CANCELAR</SecondaryText>
                      </SecondaryBtn>
                      <PrimaryBtn onPress={handleSave} disabled={saving}>
                        <PrimaryText>
                          {saving ? 'GUARDANDO...' : 'GUARDAR'}
                        </PrimaryText>
                      </PrimaryBtn>
                    </ActionsRow>
                  )}
                </BottomActions>
              </ContentWrap>
            </SidePanel>
          </Animated.View>
        </Overlay>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// =======================
// Estilos
// =======================
const Overlay = styled.View({
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
});

const SidePanel = styled.View({
  width: '100%',
  height: '100%',
  backgroundColor: '#fff',
  paddingHorizontal: 24,
});

const HeaderRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
});

const BackBtn = styled(TouchableOpacity)({
  paddingVertical: 6,
  paddingHorizontal: 4,
});

const ContentWrap = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const ProfileCard = styled.View({
  borderRadius: 28,
  borderWidth: 2,
  borderColor: BLUE,
  paddingVertical: 26,
  paddingHorizontal: 22,
  alignItems: 'center',
  position: 'relative',
});

const AvatarCircle = styled.View({
  width: 96,
  height: 96,
  borderRadius: 48,
  borderWidth: 2,
  borderColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 14,
  backgroundColor: '#f3f7ff',
});

const EditBtn = styled(TouchableOpacity)({
  position: 'absolute',
  top: 18,
  right: 18,
  padding: 6,
});

const NamePill = styled.View({
  paddingHorizontal: 26,
  paddingVertical: 8,
  borderRadius: 26,
  backgroundColor: BLUE,
  marginBottom: 20,
  alignSelf: 'center',
});

const NamePillText = styled.Text({
  fontSize: 16,
  fontWeight: '800',
  color: '#fff',
  textAlign: 'center',
  letterSpacing: 0.5,
});

// fila de inputs para nombre y apellido
const NameEditRow = styled.View({
  width: '100%',
  marginTop: 8,
  marginBottom: 20,
  alignSelf: 'center',
  flexDirection: 'column', // antes era 'row'
  gap: 8,
});

const NameInput = styled.TextInput({
  borderWidth: 1.5,
  borderColor: BLUE,
  borderRadius: 22,
  paddingHorizontal: 14,
  paddingVertical: 6,
  fontSize: 14,
  fontWeight: '700',
  color: BLUE,
});

const InfoRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  marginBottom: 14,
});

const InfoIconBox = styled.View({
  width: 34,
  height: 34,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
});

const InfoTextWrap = styled.View({
  flex: 1,
});

const InfoLabel = styled.Text({
  fontSize: 11,
  fontWeight: '700',
  color: '#013b63',
  marginBottom: 1,
});

const InfoValue = styled.Text({
  fontSize: 15,
  fontWeight: '900',
  color: BLUE,
  textTransform: 'uppercase',
});

const InfoInput = styled.TextInput({
  fontSize: 15,
  fontWeight: '900',
  color: BLUE,
  paddingVertical: 2,
  borderBottomWidth: 1,
  borderBottomColor: '#c6ddff',
});

const BottomActions = styled.View({
  marginTop: 22,
  paddingBottom: 24,
  alignItems: 'center',
  width: '100%',
  gap: 8,
});

const LogoutDivider = styled.View({
  height: 1,
  backgroundColor: '#e1e9f5',
  alignSelf: 'stretch',
  marginBottom: 16,
});

const LogoutBtn = styled(TouchableOpacity)({
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 26,
  borderRadius: 22,
  borderWidth: 1.5,
  borderColor: BLUE,
});

const LogoutText = styled.Text({
  fontSize: 14,
  fontWeight: '700',
  color: BLUE,
  marginLeft: 8,
  letterSpacing: 0.5,
});

const ActionsRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
});

const SecondaryBtn = styled(TouchableOpacity)({
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: BLUE,
  marginRight: 8,
  alignItems: 'center',
});

const SecondaryText = styled.Text({
  fontSize: 14,
  fontWeight: '700',
  color: BLUE,
});

const PrimaryBtn = styled(TouchableOpacity)({
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 22,
  backgroundColor: BLUE,
  marginLeft: 8,
  alignItems: 'center',
});

const PrimaryText = styled.Text({
  fontSize: 14,
  fontWeight: '700',
  color: '#fff',
});

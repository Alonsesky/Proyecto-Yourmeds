// components/profileUser.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
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
  const [internalVisible, setInternalVisible] = useState(visible);
  const translateX = useRef(new Animated.Value(SCREEN_W)).current;

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
      }).start(() => setInternalVisible(false));
    }
  }, [visible, translateX]);

  const name = getName(profile);
  const lastName = getLastName(profile);
  const rut = getRut(profile);
  const age = getAge(profile);
  const email = getEmail(profile);

  const fullName = `${name}${lastName ? ` ${lastName}` : ''}`;

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
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
              {/* Flecha superior fija */}
              <HeaderRow>
                <BackBtn onPress={onClose}>
                  <Ionicons name="arrow-back-outline" size={26} color={BLUE} />
                </BackBtn>
              </HeaderRow>

              {/* CONTENIDO CENTRADO (card + logout) */}
              <ContentWrap>
                <ProfileCard>
                  <AvatarCircle>
                    <Ionicons name="person-outline" size={52} color={BLUE} />
                  </AvatarCircle>

                  <EditBtn onPress={() => { /* ir a editar perfil */ }}>
                    <Ionicons name="create-outline" size={22} color={BLUE} />
                  </EditBtn>

                  <NamePill>
                    <NamePillText>{fullName}</NamePillText>
                  </NamePill>

                  <InfoRow>
                    <InfoIconBox>
                      <Ionicons name="card-outline" size={20} color={BLUE} />
                    </InfoIconBox>
                    <InfoTextWrap>
                      <InfoLabel>RUT</InfoLabel>
                      <InfoValue>{rut}</InfoValue>
                    </InfoTextWrap>
                  </InfoRow>

                  {age != null && (
                    <InfoRow>
                      <InfoIconBox>
                        <Ionicons name="calendar-outline" size={20} color={BLUE} />
                      </InfoIconBox>
                      <InfoTextWrap>
                        <InfoLabel>EDAD</InfoLabel>
                        <InfoValue>{age} AÑOS</InfoValue>
                      </InfoTextWrap>
                    </InfoRow>
                  )}

                  <InfoRow>
                    <InfoIconBox>
                      <Ionicons name="mail-outline" size={20} color={BLUE} />
                    </InfoIconBox>
                    <InfoTextWrap>
                      <InfoLabel>EMAIL</InfoLabel>
                      <InfoValue>{email}</InfoValue>
                    </InfoTextWrap>
                  </InfoRow>
                </ProfileCard>

                <LogoutWrap>
                  <LogoutDivider />
                  <LogoutBtn
                    onPress={() => {
                      onClose();
                      onLogoutPress();
                    }}
                  >
                    <Ionicons name="log-out-outline" size={22} color={BLUE} />
                    <LogoutText>CERRAR SESIÓN</LogoutText>
                  </LogoutBtn>
                </LogoutWrap>
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

/** CONTENEDOR QUE CENTRA TODO EL BLOQUE */
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

const LogoutWrap = styled.View({
  marginTop: 22,
  paddingBottom: 24,
  alignItems: 'center',
  width: '100%',
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
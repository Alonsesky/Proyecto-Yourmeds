// =======================
// Imports
// =======================
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styled from 'styled-components/native';

import ConfirmDeleteAlarmModal from '@/components/deleteComponent/confirmDelete';
import GroupDeleteOverlay from '@/components/deleteComponent/deleteGroup';
import GroupCard from '@/components/groupComponent/groupCard';
import ProfileUser from '@/components/profileComponent/profileUser';
import SesionCloseModal from '@/components/sesionClose/sesionClose';
import AddChooser from '../../components/AddChoose';

import { deleteAlarm } from '../services/alarm';
import { deleteGroup, fetchMyGroupsAndAlarms } from '../services/group';
import {
  clearToken,
  getGroupsSnapshot,
  saveGroupsSnapshot,
  saveUserId,
} from '../services/storage';
import { fetchMyId, fetchMyProfile, type MeProfile } from '../services/user';
import type { ApiGroupsResponse } from '../types/groupTypes';

// =======================
// Config & constantes
// =======================
const BLUE = '#0693E9';
const { width: SCREEN_W } = Dimensions.get('window');

// Barra inferior
const BAR_H = 60;
const BAR_R = 0;

// Muesca (notch)
const NOTCH_W = 90;
const NOTCH_D = 45;
const NOTCH_R = 30;

// FAB cuadrado redondeado
const FAB_SIZE = 64;
const FAB_RAD = 22;

// “Cuna” blanca bajo el FAB
const CUP_W = FAB_SIZE + 1;
const CUP_H = 85;
const CUP_R = 1;

// =======================
// Helpers (no UI)
// =======================
function makeBarPath(
  w: number,
  h: number,
  r: number,
  notchW: number,
  notchD: number
) {
  const cx = w / 2;
  const nL = cx - notchW / 2;
  const nR = cx + notchW / 2;

  return [
    `M ${r},0`,
    `H ${nL}`,
    `V ${notchD - NOTCH_R}`,
    `Q ${nL},${notchD} ${nL + NOTCH_R},${notchD}`,
    `H ${nR - NOTCH_R}`,
    `Q ${nR},${notchD} ${nR},${notchD - NOTCH_R}`,
    `V 0`,
    `H ${w - r}`,
    `Q ${w},0 ${w},${r}`,
    `V ${h}`,
    `H 0`,
    `V ${r}`,
    `Q 0,0 ${r},0`,
    'Z',
  ].join(' ');
}

// helper mínimo para validar hex #RRGGBB
const normalizeHex = (c?: string | null) =>
  c && /^#[0-9A-Fa-f]{6}$/.test(c.trim()) ? c.trim() : null;

// Resolver robusto del nombre del medicamento desde una alarma
const resolveMedName = (alarm: any): string =>
  alarm?.medicineName ??
  alarm?.medicine?.name ??
  alarm?.name ??
  alarm?.title ??
  alarm?.displayName ??
  alarm?.drugName ??
  'Medicamento';

// --- helpers de saludo (solo nombre) ---
const getFirstName = (p?: MeProfile | null) =>
  (p?.name ?? (p as any)?.firstName ?? '').toString().trim();

// NEW: detector de propiedad del grupo (tolera distintos nombres de campos)
const isOwner = (g: any, myId: string | number) => {
  const ownerId =
    g.ownerId ?? g.createdBy ?? g.creatorId ?? g.userOwnerId ?? g.owner?.id ?? null;
  const role =
    g.role ?? g.membershipRole ?? g.membership?.role ?? g.permission ?? null;
  const ownerFlag = g.isOwner ?? g.is_owner ?? g.owner === true;

  if (ownerFlag === true) return true;
  if (ownerId != null) return String(ownerId) === String(myId);
  if (role != null) return String(role).toUpperCase() === 'OWNER';
  return false;
};

// =======================
// Componente
// =======================
export default function Home() {
  const [showDebug, setShowDebug] = useState(false);

  const router = useRouter();
  const [chooserOpen, setChooserOpen] = useState(false);

  // Estado de datos
  const [snapshot, setSnapshot] = useState<ApiGroupsResponse>({
    userId: 0,
    name: '',
    groups: [],
  });
  const [me, setMe] = useState<MeProfile | null>(null); // perfil para saludo
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ¿Hay grupos creados?
  const hasGroups = (snapshot.groups ?? []).length > 0;

  // Navegación original
  const handlePick = (type: 'alarm' | 'group') => {
    setChooserOpen(false);
    if (type === 'alarm') router.push('../(alarm)/alarm');
    else router.push('../(group)/group');
  };

  // Versión protegida: bloquea "alarm" si no hay grupos
  const handlePickSafe = useCallback(
    (type: 'alarm' | 'group') => {
      if (type === 'alarm' && !hasGroups) {
        Alert.alert(
          'Primero crea un grupo',
          'Para agregar una alarma debes tener al menos un grupo.'
        );
        return;
      }
      handlePick(type);
    },
    [hasGroups]
  );

  // Estado panel de perfil
  const [profileVisible, setProfileVisible] = useState(false);
  const handleOpenProfile = useCallback(() => setProfileVisible(true), []);
  const handleCloseProfile = useCallback(() => setProfileVisible(false), []);

  // ====== Estado para eliminar ALARMA ======
  const [delState, setDelState] = useState<{
    visible: boolean;
    groupId?: number;
    alarmId?: number | string;
    medicineName?: string;
    loading?: boolean;
  }>({ visible: false, loading: false });

  const openDelete = useCallback(
    (groupId: number, alarmId: number | string, medicineName: string) => {
      setDelState({ visible: true, groupId, alarmId, medicineName, loading: false });
    },
    []
  );

  const cancelDelete = useCallback(() => {
    setDelState((s) => ({ ...s, visible: false, loading: false }));
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!delState.groupId || delState.alarmId == null) return;
    try {
      setDelState((s) => ({ ...s, loading: true }));
      await deleteAlarm(delState.alarmId);

      // Remover de estado local
      setSnapshot((prev) => ({
        ...prev,
        groups:
          prev.groups?.map((g) =>
            g.groupId === delState.groupId
              ? { ...g, alarms: (g.alarms || []).filter((a) => a.id !== delState.alarmId) }
              : g
          ) || [],
      }));

      setDelState({ visible: false, loading: false });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo eliminar la alarma.');
      setDelState((s) => ({ ...s, loading: false }));
    }
  }, [delState.groupId, delState.alarmId]);

  // ====== Estado para eliminar GRUPO ======
  const [groupDelVisible, setGroupDelVisible] = useState(false);
  const [groupDelLoading, setGroupDelLoading] = useState(false);

  // ====== Estado para cerrar sesión ======
  const [logoutVisible, setLogoutVisible] = useState(false);
  const handleOpenLogout = useCallback(() => setLogoutVisible(true), []);
  const handleCancelLogout = useCallback(() => setLogoutVisible(false), []);
  const handleConfirmLogout = useCallback(async () => {
    try {
      await clearToken();
      router.replace('/(auth)/login');
    } finally {
      setLogoutVisible(false);
    }
  }, [router]);

  // Refs para control de efectos
  const fetchingRef = useRef(false);
  const mountedRef = useRef(false);

  // =======================
  // Funciones auxiliares
  // =======================
  const [probando, setProbando] = useState(false);
  const getMyId = useCallback(async () => {
    if (probando) return;
    setProbando(true);
    try {
      const id = await fetchMyId();
      Alert.alert('OK', String(id));
      await saveUserId(id);
    } catch (e: any) {
      const msg =
        e?.status === 401
          ? 'No autorizado (401). Revisa tu token o sesión.'
          : e?.message || 'Falló la petición.';
      Alert.alert('Error', msg);
    } finally {
      setProbando(false);
    }
  }, [probando]);

  // 1) Carga cache
  const loadFromStorage = useCallback(async () => {
    const cached = await getGroupsSnapshot();
    if (cached?.data) setSnapshot(cached.data);
  }, []);

  // 2) Refresca desde API (sin reentradas; maneja 401 limpiando sesión)
  const refreshFromAPI = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const data = await fetchMyGroupsAndAlarms();
      if (!mountedRef.current) return;
      setSnapshot(data);
      await saveGroupsSnapshot(data);
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status === 401) {
        Alert.alert('Sesión expirada', 'Vuelve a iniciar sesión.');
        await clearToken();
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Error', 'No fue posible cargar tus grupos.');
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [router]);

  // 3) Enfocar Home: cache -> API (una vez por foco) + perfil
  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const id = await fetchMyId();
          if (!id) return;

          // Perfil para saludo (solo nombre)
          try {
            const profile = await fetchMyProfile();
            setMe(profile ?? null);
          } catch {
            setMe(null);
          }

          const remote = await fetchMyGroupsAndAlarms();
          await saveGroupsSnapshot(remote);

          setSnapshot(remote);
          setLoading(false);
        } catch (err) {
          console.error('Error al cargar datos del usuario:', err);
          setLoading(false);
        }
      }
      load();
    }, [])
  );

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFromAPI();
    setRefreshing(false);
  }, [refreshFromAPI]);

  // NEW: calcula lista de grupos borrables (solo propietarios)
  const myId = snapshot.userId ?? null;
  const deletableGroups = (snapshot.groups || []).filter((g) => isOwner(g, myId));

  // =======================
  // Render (un solo return)
  // =======================
  return (
    <Screen>
      {/* Header */}
      <SafeArea
        style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
      >
        <HeaderBar>
          <HeaderTitle>ALARMA</HeaderTitle>

          <HeaderActions>
            <IconBtn onPress={() => setGroupDelVisible(true)}>
              <Ionicons name="trash-outline" size={32} color={BLUE} />
            </IconBtn>
          </HeaderActions>
        </HeaderBar>
      </SafeArea>

      {/* Lista con scroll */}
      <FlatList
        style={{ flex: 1 }}
        data={snapshot.groups ?? []}
        keyExtractor={(g) => String(g.groupId)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: BAR_H + 90 }}
        ListHeaderComponent={
          <GreetingWrap>
            <GreetingHello>Hola,</GreetingHello>
            <GreetingName>
              {getFirstName(me) || snapshot.name || 'usuario'}
            </GreetingName>
          </GreetingWrap>
        }
        renderItem={({ item: group }) => {
          const tint = normalizeHex(group.color) ?? BLUE;
          const iAmOwner = isOwner(group, myId);   // <<--- ¿soy dueño de este grupo?

          const getMedName = (alarmId: number | string) => {
            const a = group.alarms?.find((x) => x.id === alarmId);
            return resolveMedName(a);
          };

          return (
            <View style={{ marginBottom: 16 }}>
              <GroupCard
                name={group.name}
                tint={tint}
                autoContrast
                alarms={group.alarms || []}
                initiallyOpen={true}
                canEdit={iAmOwner}  // <<--- NUEVO: para que el card pinte los iconos deshabilitados
                onToggleAlarm={(id, next) => {
                  // TODO: endpoint activar/desactivar
                }}
                onEditAlarm={
                  iAmOwner
                    ? (id) => {
                        router.push({
                          pathname: '../(alarm)/alarm',
                          params: { alarmId: String(id) },
                        });
                      }
                    : undefined
                }
                onDeleteAlarm={
                  iAmOwner
                    ? (id: number | string, medicineName?: string) => {
                        const med = medicineName ?? getMedName(id);
                        openDelete(group.groupId as number, id, med);
                      }
                    : undefined
                }
              />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 16 }}>Aún no tienes grupos.</Text>
              <Text style={{ fontSize: 12, opacity: 0.7 }}>
                Crea uno con el botón +
              </Text>
            </View>
          ) : null
        }
      />

      {/* Modal de opciones */}
      <AddChooser
        visible={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onPick={handlePickSafe}
        canAddAlarm={hasGroups}
      />

      {/* Modal de perfil de usuario */}
      <ProfileUser
        visible={profileVisible}
        onClose={handleCloseProfile}
        onLogoutPress={handleOpenLogout}
        profile={me}
      />

      {/* Modal de cierre de sesión */}
      <SesionCloseModal
        visible={logoutVisible}
        onCancel={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />

      {/* Modal de confirmar eliminación de ALARMA */}
      <ConfirmDeleteAlarmModal
        visible={delState.visible}
        medicineName={delState.medicineName ?? ''}
        loading={!!delState.loading}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* Overlay seleccionar y borrar GRUPO */}
      <GroupDeleteOverlay
        visible={groupDelVisible}
        loading={groupDelLoading}
        groups={deletableGroups.map((g) => ({
          groupId: g.groupId as number,
          name: g.name,
          color: g.color || null,
        }))}
        onCancel={() => setGroupDelVisible(false)}
        onConfirm={async (groupId) => {
          try {
            setGroupDelLoading(true);
            const uid = snapshot.userId || (await fetchMyId());
            await deleteGroup(groupId);
            setSnapshot((prev) => ({
              ...prev,
              groups: (prev.groups || []).filter((g) => g.groupId !== groupId),
            }));
            setGroupDelVisible(false);
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'No se pudo eliminar el grupo.');
          } finally {
            setGroupDelLoading(false);
          }
        }}
        bottomInset={BAR_H - 100}
        confirmBottom={BAR_H - NOTCH_D + (CUP_H - 64) / 2}
      />

      {/* Barra inferior + FAB */}
      <BottomWrap>
        <Svg width={SCREEN_W} height={BAR_H} style={{ position: 'absolute', bottom: 0 }}>
          <Path d={makeBarPath(SCREEN_W, BAR_H, BAR_R, NOTCH_W, NOTCH_D)} fill={BLUE} />
        </Svg>

        <Cup
          style={{
            left: (SCREEN_W - CUP_W) / -1,
            bottom: BAR_H - NOTCH_D + 4,
          }}
        />

        <BarContent>
          {/* Botón izquierda: alarmas */}
          <BarButton
            onPress={() => {
              /* ir a Alarmas */
            }}
          >
            <Ionicons name="alarm-outline" size={26} color="#fff" />
          </BarButton>

          {/* Botón derecha: PERFIL */}
          <BarButton onPress={handleOpenProfile}>
            <Ionicons name="person-circle-outline" size={26} color="#fff" />
          </BarButton>
        </BarContent>

        <FabSquare
          onPress={() => setChooserOpen(true)}
          style={{
            position: 'absolute',
            left: (SCREEN_W - FAB_SIZE) / 2,
            bottom: BAR_H - NOTCH_D + (CUP_H - FAB_SIZE) / 2,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 10,
          }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </FabSquare>
      </BottomWrap>
    </Screen>
  );
}

// =======================
// Estilos
// =======================
const Screen = styled.View({
  flex: 1,
  backgroundColor: '#fff',
});

const SafeArea = styled(SafeAreaView)({
  backgroundColor: '#fff',
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

const HeaderActions = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const IconBtn = styled.TouchableOpacity({
  padding: 6,
  borderRadius: 12,
});

const TrashButton = styled.TouchableOpacity({
  padding: 8,
  borderRadius: 12,
});

const GreetingWrap = styled.View({
  paddingTop: 8,
  paddingBottom: 20,
  paddingHorizontal: 4,
});

const GreetingHello = styled.Text({
  color: '#013b63',
  fontSize: 14,
  fontWeight: '700',
  letterSpacing: 0.5,
  opacity: 0.8,
});

const GreetingName = styled.Text({
  color: BLUE,
  fontSize: 26,
  fontFamily: 'Oswald-Bold',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginTop: 2,
});

const BottomWrap = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: BAR_H + 20,
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const BarContent = styled.View({
  position: 'absolute',
  bottom: 0,
  height: BAR_H,
  width: SCREEN_W,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 32,
});

const BarButton = styled.TouchableOpacity({
  padding: 10,
});

const Cup = styled.View({
  position: 'absolute',
  width: CUP_W,
  height: CUP_H,
  backgroundColor: '#fff',
  borderTopLeftRadius: CUP_R,
  borderTopRightRadius: CUP_R,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
});

const FabSquare = styled.TouchableOpacity({
  width: FAB_SIZE,
  height: FAB_SIZE,
  borderRadius: FAB_RAD,
  backgroundColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
});

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

import AddChooser from '../../components/AddChoose';

import GroupCard from '@/components/groupComponent/groupCard';
import { fetchMyGroupsAndAlarms } from '../services/group';
import {
  clearToken,
  getGroupsSnapshot,
  saveGroupsSnapshot,
  saveUserId,
} from '../services/storage';
import { fetchMyId } from '../services/user';
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

// =======================
// Componente
// =======================
export default function Home() {
  // Visualización de storage (debug opcional)
  const [showDebug, setShowDebug] = useState(false);

  const router = useRouter();
  const [chooserOpen, setChooserOpen] = useState(false);
  const handlePick = (type: 'alarm' | 'group') => {
    setChooserOpen(false);
    if (type === 'alarm') router.push('../(alarm)/alarm');
    else router.push('../(group)/group');
  };

  // Estado de datos
  const [snapshot, setSnapshot] = useState<ApiGroupsResponse>({
    userId: 0,
    name: '',
    groups: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      Alert.alert('OK ✅', String(id));
      await saveUserId(id);
    } catch (e: any) {
      const msg =
        e?.status === 401
          ? 'No autorizado (401). Revisa tu token o sesión.'
          : e?.message || 'Falló la petición.';
      Alert.alert('Error ❌', msg);
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

  // 3) Enfocar Home: cache -> API (una vez por foco)
  useFocusEffect(
    useCallback(() => {
      async function load() {
        try {
          const id = await fetchMyId();
          if (!id) return;

          // 1 Consulta info desde la API
          const remote = await fetchMyGroupsAndAlarms();

          // 2 snapshot local para este usuario
          await saveGroupsSnapshot(remote);

          // 3 Mostrar información
          setSnapshot(remote);
        } catch (err) {
          console.error("Error al cargar datos del usuario:", err);
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

  // =======================
  // Render (un solo return)
  // =======================
  return (
    <Screen>
      {/* Header */}
      <SafeArea style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <HeaderBar>
          <HeaderTitle>ALARMA</HeaderTitle>
          <TrashButton onPress={() => { /* TODO: acción o limpieza */ }}>
            <Ionicons name="trash-outline" size={37} color={BLUE} />
          </TrashButton>
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
          <View style={{ paddingTop: 8, paddingBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 12 }}>
              Hola, {snapshot.name || 'usuario'}
            </Text>
          </View>
        }
        renderItem={({ item: group }) => {
          const tint = normalizeHex(group.color) ?? BLUE;
          return (
            <View style={{ marginBottom: 16 }}>
              <GroupCard
                name={group.name}
                tint={tint}
                autoContrast
                alarms={group.alarms || []}
                initiallyOpen={true} // controlado por la flecha dentro del card
                onToggleAlarm={(id, next) => {
                  // TODO: llamar endpoint PATCH/PUT para activar/desactivar
                  console.log('toggle', id, next);
                }}
                onEditAlarm={(id) => {
                  // TODO: navigate a pantalla de edición
                  console.log('edit', id);
                }}
                onDeleteAlarm={(id) => {
                  // TODO: confirmar y llamar delete
                  console.log('delete', id);
                }}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={{ padding: 20 }}>
              <Text style={{ fontSize: 16 }}>Aún no tienes grupos.</Text>
              <Text style={{ fontSize: 12, opacity: 0.7 }}>Crea uno con el botón +</Text>
            </View>
          ) : null
        }
      />

      {/* Modal de opciones */}
      <AddChooser
        visible={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onPick={handlePick}
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
          <BarButton onPress={() => { /* TODO: ir a Alarmas */ }}>
            <Ionicons name="alarm-outline" size={26} color="#fff" />
          </BarButton>
          <BarButton onPress={() => { /* TODO: ir a Notas */ }}>
            <Ionicons name="document-text-outline" size={26} color="#fff" />
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

const TrashButton = styled.TouchableOpacity({
  padding: 8,
  borderRadius: 12,
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

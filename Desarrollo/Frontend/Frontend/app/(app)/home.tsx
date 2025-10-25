// =======================
// Imports
// =======================
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Button, Dimensions, Platform, SafeAreaView, StatusBar, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styled from 'styled-components/native';
import AddChooser from '../../components/AddChoose';
import AlarmCard from '../../components/AlarmCard';

import { clearToken, saveUserId } from "../services/storage";
import { fetchMyId } from '../services/user';
import DebugStorageModal from '../storageScreen/DebugStorageModal';

// =======================
// Config & constantes
// =======================
const BLUE = '#0693E9';
const { width: SCREEN_W } = Dimensions.get('window');

// Barra inferior
const BAR_H = 60;  // alto de la barra
const BAR_R = 0;   // radio bordes superiores

// Muesca (notch)
const NOTCH_W = 90;   // ancho
const NOTCH_D = 45;   // profundidad
const NOTCH_R = 30;   // radio de esquinas inferiores

// FAB cuadrado redondeado
const FAB_SIZE = 64;
const FAB_RAD = 22;

// “Cuna” blanca bajo el FAB
const CUP_W = FAB_SIZE + 1; // un poco más ancho que el FAB
const CUP_H = 85;
const CUP_R = 1;

// =======================
// Helpers (no UI)
// =======================
/** Genera el path de la barra con muesca cuadrada (con radio inferior suave) */
function makeBarPath(
  w: number,
  h: number,
  r: number,
  notchW: number,
  notchD: number
) {
  const cx = w / 2;
  const nL = cx - notchW / 2; // inicio de muesca arriba (x)
  const nR = cx + notchW / 2; // fin de muesca arriba (x)

  return [
    `M ${r},0`,
    `H ${nL}`,                          // borde sup. hasta la muesca
    `V ${notchD - NOTCH_R}`,            // baja por el lado izq. de la muesca
    `Q ${nL},${notchD} ${nL + NOTCH_R},${notchD}`,          // esquina inf-izq
    `H ${nR - NOTCH_R}`,                // fondo plano de la muesca
    `Q ${nR},${notchD} ${nR},${notchD - NOTCH_R}`,          // esquina inf-der
    `V 0`,                              // sube por el lado der. de la muesca
    `H ${w - r}`,
    `Q ${w},0 ${w},${r}`,               // esquina sup-der
    `V ${h}`,
    `H 0`,
    `V ${r}`,
    `Q 0,0 ${r},0`,                     // esquina sup-izq
    'Z',
  ].join(' ');
}

  
// =======================
// Componente
// =======================
export default function Home() {
  //Variables para storage visual
  const [showDebug, setShowDebug] = useState(false);
  
  const router = useRouter();
  const [chooserOpen, setChooserOpen] = useState(false);

  const handlePick = (type: 'alarm' | 'group') => {
    setChooserOpen(false);
    if (type === 'alarm') {
      router.push('../(alarm)/alarm');
    } else {
      // TODO: navegar/abrir crear grupo
      // router.push('/groups/new')
    }
  };

  // =======================
  // Funciones
  // =======================
  const [probando, setProbando] = useState(false);

  const getMyId = useCallback(async () => {
  if (probando) return;
  setProbando(true);
  try {
    const id = await fetchMyId(); 
    Alert.alert("OK ✅", id);
    await saveUserId(id);
  } catch (e: any) {
    const msg = e?.status === 401
      ? "No autorizado (401). Revisa tu token o sesión."
      : e?.message || "Fallo la petición.";
    Alert.alert("Error ❌", msg);
  } finally {
    setProbando(false);
  }
}, [probando]);


  
  return (
    <Screen>
      {/* Header */}
      <SafeArea style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <HeaderBar>
          <HeaderTitle>ALARMA</HeaderTitle>

          <TrashButton onPress={() => {
            // TODO: eliminar/limpiar
          }}>
            <Ionicons name="trash-outline" size={37} color={BLUE} />
          </TrashButton>
        </HeaderBar>
      </SafeArea>
        <View style={{ marginTop: 12, paddingHorizontal: 8, paddingBottom: BAR_H + 90 }}>
          <AlarmCard
            groupLabel="GRUPO PERSONAL"
            count={1}
            statusText="No hay alarma"
            onPress={() => {
              // TODO: expandir/colapsar detalle
            }}
          />
        </View>
        {/* PRUEBA DE ENDPOINTS */}
        <View style={{ flex:1, padding:20, justifyContent:"center" }}>
          <Text style={{ fontSize:20, fontWeight:"bold" }}>Inicio</Text>
          <View style={{ height:12 }} />
          <Button title="Probar endpoint protegido" onPress={getMyId} />
          <View style={{ height:12 }} />
          <Button title="Cerrar sesión" onPress={async () => {
            await clearToken();
            router.replace('/(auth)/login');
          }} />

          <Button title="Ver AsyncStorage" onPress={() => setShowDebug(true)} />

          <DebugStorageModal visible={showDebug} onClose={() => setShowDebug(false)} />
        </View>

        {/* === Modal de opciones === */}
      <AddChooser
        visible={chooserOpen}
        onClose={() => setChooserOpen(false)}
        onPick={handlePick}
      />
      
      {/* Barra inferior con muesca y FAB */}
      <BottomWrap>
        {/* Barra azul (SVG) */}
        <Svg width={SCREEN_W} height={BAR_H} style={{ position: 'absolute', bottom: 0 }}>
          <Path d={makeBarPath(SCREEN_W, BAR_H, BAR_R, NOTCH_W, NOTCH_D)} fill={BLUE} />
        </Svg>

        {/* Cuna blanca que “abraza” al FAB */}
        <Cup
          style={{
            left: (SCREEN_W - CUP_W) / -1,
            bottom: BAR_H - NOTCH_D + 4, // pequeño ajuste para evitar líneas
          }}
        />

        {/* Acciones izquierda/derecha */}
        <BarContent>
          <BarButton onPress={() => { /* TODO: ir a Alarmas */ }}>
            <Ionicons name="alarm-outline" size={26} color="#fff" />
          </BarButton>

          <BarButton onPress={() => { /* TODO: ir a Notas */ }}>
            <Ionicons name="document-text-outline" size={26} color="#fff" />
          </BarButton>
        </BarContent>

        {/* FAB centrado en la cuna */}
        <FabSquare
          onPress={() => setChooserOpen(true)}
          style={{
            position: 'absolute',
            left: (SCREEN_W - FAB_SIZE) / 2,
            bottom: BAR_H - NOTCH_D + (CUP_H - FAB_SIZE) / 2, // centrado vertical en la cuna
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
  height: BAR_H + 20, // espacio para cuna + sombra del FAB
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

/** Cuna blanca (semirrectángulo con radio arriba) */
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

/** FAB cuadrado redondeado */
const FabSquare = styled.TouchableOpacity({
  width: FAB_SIZE,
  height: FAB_SIZE,
  borderRadius: FAB_RAD,
  backgroundColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
});

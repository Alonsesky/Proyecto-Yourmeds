import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

type Item = { groupId: number; name: string; color?: string | null };

type Props = {
  visible: boolean;
  loading?: boolean;
  groups: Item[];
  selectedId?: number | null;
  onCancel: () => void;
  onConfirm: (groupId: number) => void;
  bottomInset?: number;       // espacio que NO se oscurece (barra)
  confirmBottom?: number;     // altura para alinear con tu FAB
};

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

export default function GroupDeleteOverlay({
  visible,
  loading,
  groups,
  onCancel,
  onConfirm,
  bottomInset = 0,
  confirmBottom = 24,
}: Props) {
  const [picked, setPicked] = React.useState<number | null>(null);

  if (!visible) return null;

  return (
    <Wrap pointerEvents="box-none">
      {/* Backdrop: parte superior oscura */}
      <Dim style={{ height: SCREEN_H - bottomInset }} />
      {/* Zona inferior transparente para dejar la barra tal cual */}
      <Spacer style={{ height: bottomInset }} pointerEvents="none" />

      {/* Cabecera: botón cancelar en píldora blanca */}
      <Header>
        <CancelPill onPress={onCancel} disabled={loading}>
          <CancelText>CANCELAR</CancelText>
          <Ionicons name="trash-outline" size={18} color="#2B6CB0" />
        </CancelPill>
      </Header>

      {/* Lista de grupos */}
      <Content>
        <FlatList
          data={groups}
          keyExtractor={(g) => String(g.groupId)}
          renderItem={({ item }) => {
            const active = picked === item.groupId;
            return (
              <GroupRow onPress={() => setPicked(item.groupId)}>
                <Left>
                  <IconCircle>
                    <Ionicons name="people" size={18} color={WHITE} />
                  </IconCircle>
                  <Name>{item.name}</Name>
                </Left>
                <PickOuter active={active}>
                  {active && <PickInner />}
                </PickOuter>
              </GroupRow>
            );
          }}
          ItemSeparatorComponent={() => <Separator />}
          contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 12, paddingBottom: 140 }}
        />
      </Content>

      {/* Texto “Presione para confirmar” */}
      <ConfirmHint pointerEvents="none">
        <HintText>Presione para confirmar</HintText>
      </ConfirmHint>

      {/* Botón confirmar alineado con FAB */}
      <ConfirmFab
        style={{
          bottom: confirmBottom,
        }}
        onPress={() => picked != null && onConfirm(picked)}
        disabled={loading || picked == null}
      >
        <Ionicons name="trash" size={28} color={WHITE} />
      </ConfirmFab>
    </Wrap>
  );
}

/* ===== styled ===== */
const Wrap = styled.View({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 50,
});

const Dim = styled.View({
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.55)',
});

const Spacer = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
});

const Header = styled.View({
  position: 'absolute',
  top: 10,
  right: 10,
});

const CancelPill = styled(TouchableOpacity)({
  backgroundColor: WHITE,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const CancelText = styled(Text)({
  color: '#2B6CB0',
  fontWeight: '900',
  letterSpacing: 0.3,
});

const Content = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 60,
  bottom: 0,
});

const GroupRow = styled(TouchableOpacity)({
  backgroundColor: BLUE,
  borderRadius: 14,
  paddingVertical: 14,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Left = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const IconCircle = styled.View({
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: 'rgba(255,255,255,0.25)',
  alignItems: 'center',
  justifyContent: 'center',
});

const Name = styled(Text)({
  color: WHITE,
  fontSize: 16,
  fontWeight: '900',
});

const PickOuter = styled.View<{ active: boolean }>(({ active }) => ({
  width: 26,
  height: 26,
  borderRadius: 13,
  borderWidth: 2,
  borderColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
}));

const PickInner = styled.View({
  width: 14,
  height: 14,
  borderRadius: 7,
  backgroundColor: WHITE,
});

const Separator = styled.View({
  height: 12,
});

const ConfirmHint = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 90,
  alignItems: 'center',
});

const HintText = styled(Text)({
  color: WHITE,
  fontWeight: '900',
});

const ConfirmFab = styled(TouchableOpacity)({
  position: 'absolute',
  alignSelf: 'center',
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: BLUE,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 10,
});

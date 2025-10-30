import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, ListRenderItem, Platform } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type GroupRole = 'editor' | 'lector';

export type UserRow = {
  id: string;
  email: string;
  role: GroupRole;
};

type Props = {
  label?: string;
  inset?: number;            // padding horizontal externo
  marginTop?: number;        // separación con el bloque anterior
  items: UserRow[];
  onDelete?: (id: string) => void;
  onPressRow?: (id: string) => void; // opcional para futuro
};

export default function ListUsers({
  label = 'LISTA DE USUARIOS',
  inset = 2,
  marginTop = 4,
  items,
  onDelete,
  onPressRow,
}: Props) {
  const renderItem: ListRenderItem<UserRow> = ({ item }) => (
    <RowButton
      activeOpacity={onPressRow ? 0.85 : 1}
      onPress={() => onPressRow?.(item.id)}
    >
      {/* email */}
      <EmailWrap>
        <CellEmail numberOfLines={1} ellipsizeMode="middle">
          {item.email}
        </CellEmail>
      </EmailWrap>

      {/* separador */}
      <DividerVert />

      {/* role */}
      <RoleWrap>
        <CellRole>{item.role === 'editor' ? 'Editor' : 'Lector'}</CellRole>
      </RoleWrap>

      {/* botón eliminar */}
      <DeleteBtn onPress={() => onDelete?.(item.id)} activeOpacity={0.9}>
        <DeleteText>Eliminar</DeleteText>
      </DeleteBtn>

      {/* icono al extremo */}
      <RightCircle>
        <Ionicons name="people" size={16} color={BLUE} />
      </RightCircle>
    </RowButton>
  );

  return (
    <Wrap style={{ paddingHorizontal: inset, marginTop }}>
      <FieldLabel>{label}</FieldLabel>

      <Panel>
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 1 }}  
          ItemSeparatorComponent={() => <Sep />}
          keyboardShouldPersistTaps="handled"
        />
      </Panel>
    </Wrap>
  );
}

/* ========= estilos ========= */

const Wrap = styled.View({});

const FieldLabel = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

const Panel = styled.View({
  backgroundColor: BLUE,
  borderRadius: 26,
  minHeight: 160,
});

/* fila “chip” blanca – estilo clásico */
const RowButton = styled.TouchableOpacity({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: WHITE,
  borderRadius: 16,
  paddingVertical: 4,      // ← padding vertical (no height fija)
  paddingLeft: 12,
  paddingRight: 40,        // deja espacio al círculo derecho
  position: 'relative',
  width: '100%',
  alignSelf: 'stretch',
});

const EmailWrap = styled.View({
  flex: 1.4,
  justifyContent: 'center',
  minWidth: 0,             // permite que el texto se encoja
});

const RoleWrap = styled.View({
  flex: 0.7,
  justifyContent: 'center',
  minWidth: 0,
});

const CellEmail = styled.Text({
  color: BLUE,
  fontWeight: '800',
  fontSize: 14,                                    
  lineHeight: Platform.select({ web: 18, default: 18 }),
  includeFontPadding: false as any,
});

const DividerVert = styled.View({
  width: 1,
  height: 20,                                       
  backgroundColor: 'rgba(6,147,233,0.35)',
  marginHorizontal: 10,
});

const CellRole = styled.Text({
  color: BLUE,
  fontWeight: '800',
  fontSize: 13,
  lineHeight: Platform.select({ web: 16, default: 16 }),
  includeFontPadding: false as any,
  textAlign: 'left',
});

/* botón eliminar dentro de la fila */
const DeleteBtn = styled.TouchableOpacity({
  backgroundColor: BLUE,
  borderRadius: 16,
  paddingVertical: 6,
  paddingHorizontal: 12,
  marginLeft: 8,
  alignItems: 'center',
  justifyContent: 'center',
});
const DeleteText = styled.Text({
  color: WHITE,
  fontWeight: '900',
  fontSize: 12,
  includeFontPadding: false as any,
});

const RightCircle = styled.View({
  position: 'absolute',
  right: 6,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: WHITE,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: BLUE,
});

const Sep = styled.View({
  height: 8,
});
import React from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type UserRow = {
  id: string;
  email: string;
};

type Props = {
  items: UserRow[];
  onDelete: (id: string) => void;
};

export default function ListUsers({ items, onDelete }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card>
          <Row>
            <Email>{item.email}</Email>
            <DeleteBtn onPress={() => onDelete(item.id)} activeOpacity={0.85}>
              <DeleteText>Eliminar</DeleteText>
            </DeleteBtn>
          </Row>
        </Card>
      )}

      // <- placeholder cuando no hay items
      ListEmptyComponent={
        <EmptyWrap>
          <EmptyText>No hay usuarios agregados</EmptyText>
        </EmptyWrap>
      }

      // Para que el EmptyWrap se centre y el contenedor “crezca”
      contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : undefined}
      ItemSeparatorComponent={() => <Sep />}
    />
  );
}

/* ============ estilos ============ */
const Card = styled.View({
  backgroundColor: WHITE,        // <- “detalle” blanco
  borderRadius: 14,
  paddingVertical: 3,
  paddingHorizontal: 12,
  // Sombra suave (iOS) + elevación (Android)
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
});

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Email = styled.Text({
  color: BLUE,
  fontWeight: '700',
  fontSize: 14,
});

const DeleteBtn = styled.TouchableOpacity({
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#a5d1faff',
  backgroundColor: 'transparent',
});

const DeleteText = styled.Text({
  color: BLUE,
  fontWeight: '800',
});

const Sep = styled.View({
  height: 8, // espacio entre cards
});

const EmptyWrap = styled.View({
  flex: 1,
  minHeight: 120,              // <- asegura altura cuando está vacío
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyText = styled.Text({
  color: '#FFFFFF',
  fontWeight: '800',
  opacity: 0.9,
});
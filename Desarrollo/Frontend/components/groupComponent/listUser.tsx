import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';
const WHITE = '#FFFFFF';

export type UserRow = {
  id: string;
  email: string;
  name?: string;
  last_name?: string;
  isOwner?: boolean;
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
      renderItem={({ item }) => {
        const hasName = !!item.name || !!item.last_name;
        const showEmailAsFallback = !hasName && !!item.email;

        return (
          <Card>
            <Row>
              <NameBlock>
                {/* nombre + apellido si existen */}
                {item.name ? <Name>{item.name}</Name> : null}
                {item.last_name ? <LastName>{item.last_name}</LastName> : null}

                {/* si NO hay nombre/apellido → mostrar correo */}
                {showEmailAsFallback && (
                  <EmailFallback>{item.email}</EmailFallback>
                )}

                {/* último fallback por si no viene nada de nada */}
                {!hasName && !item.email && (
                  <EmailFallback>Usuario</EmailFallback>
                )}
              </NameBlock>

              {/* Dueño: solo icono de estrella, sin botón de eliminar */}
              {item.isOwner ? (
                <OwnerBadge>
                  <Ionicons name="star" size={18} color={BLUE} />
                </OwnerBadge>
              ) : (
                <DeleteBtn onPress={() => onDelete(item.id)} activeOpacity={0.85}>
                  <DeleteText>Eliminar</DeleteText>
                </DeleteBtn>
              )}
            </Row>
          </Card>
        );
      }}
      ListEmptyComponent={
        <EmptyWrap>
          <EmptyText>No hay usuarios agregados</EmptyText>
        </EmptyWrap>
      }
      contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : undefined}
      ItemSeparatorComponent={() => <Sep />}
    />
  );
}

/* ============ estilos ============ */
const Card = styled.View({
  backgroundColor: WHITE,
  borderRadius: 14,
  paddingVertical: 3,
  paddingHorizontal: 12,
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

const NameBlock = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
  maxWidth: '70%',
});

const Name = styled.Text({
  color: BLUE,
  fontWeight: '700',
  fontSize: 14,
});

const LastName = styled.Text({
  color: BLUE,
  fontWeight: '700',
  fontSize: 14,
  marginLeft: 4,
});

const EmailFallback = styled.Text({
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

const OwnerBadge = styled.View({
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 999,
  borderWidth: 2,
  borderColor: '#a5d1faff',
  backgroundColor: '#f5fbffff',
  alignItems: 'center',
  justifyContent: 'center',
});

const Sep = styled.View({
  height: 8,
});

const EmptyWrap = styled.View({
  flex: 1,
  minHeight: 120,
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyText = styled.Text({
  color: '#FFFFFF',
  fontWeight: '800',
  opacity: 0.9,
});

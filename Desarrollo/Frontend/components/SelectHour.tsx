import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import styled from 'styled-components/native';

const BLUE = '#0693E9';

// ====== Props públicas ======
export type WheelPublicProps = {
  range: number[];                 // p.ej. [0..23] o [0..59]
  value: number;                   // valor seleccionado
  onChange: (v: number) => void;   // callback al cambiar
  width?: number;                  // ancho de la columna
  itemHeight?: number;             // alto de cada fila (↑ separación)
  activeSize?: number;             // fontSize del activo
  inactiveSize?: number;           // fontSize de los inactivos
  fadeColor?: string;              // color de los inactivos
  visiblePad?: number;             // filas extra visibles arriba/abajo
};

const DEFAULTS = {
  width: 90,
  itemHeight: 60,          // <- más alto que antes (mejor separación)
  activeSize: 52,
  inactiveSize: 34,
  fadeColor: 'rgba(6,147,233,0.35)',
  visiblePad: 2,
};

// ====== Wheel infinito performante ======
function InfiniteWheel(props: WheelPublicProps) {
  const {
    range,
    value,
    onChange,
    width = DEFAULTS.width,
    itemHeight = DEFAULTS.itemHeight,
    activeSize = DEFAULTS.activeSize,
    inactiveSize = DEFAULTS.inactiveSize,
    fadeColor = DEFAULTS.fadeColor,
    visiblePad = DEFAULTS.visiblePad,
  } = props;

  const listRef = useRef<FlatList<number>>(null);

  // 1) duplicamos contenido para simular infinito (3x)
  const loopData = useMemo(() => [...range, ...range, ...range], [range]);
  const blockSize = range.length * itemHeight;

  // índice “visual” dentro del loopData
  const [visualIndex, setVisualIndex] = useState(0);

  // Posición base (centro del bloque del medio)
  const middleStart = useMemo(() => {
    const idx = range.indexOf(value);
    return (range.length + idx) * itemHeight; // segundo bloque
  }, [range, value, itemHeight]);

  // Coloca la lista al valor actual en el bloque central
  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: middleStart, animated: false });
      setVisualIndex(range.length + range.indexOf(value));
    });
  }, [middleStart, range]);

  // Re-centra si nos alejamos mucho del bloque del medio (para mantener “infinito”)
  const maybeRecenter = useCallback((y: number) => {
    if (y < blockSize * 0.5) {
      // nos fuimos hacia arriba -> sumo un bloque
      listRef.current?.scrollToOffset({ offset: y + blockSize, animated: false });
    } else if (y > blockSize * 2.5) {
      // nos fuimos hacia abajo -> resto un bloque
      listRef.current?.scrollToOffset({ offset: y - blockSize, animated: false });
    }
  }, [blockSize]);

  const computeFromOffset = useCallback(
    (y: number, doSnap: boolean) => {
      maybeRecenter(y);
      const i = Math.round(y / itemHeight);
      setVisualIndex(i);

      // valor real (módulo el tamaño del rango)
      const realIdx = ((i % range.length) + range.length) % range.length;
      const realVal = range[realIdx];
      onChange(realVal);

      if (doSnap) {
        listRef.current?.scrollToOffset({ offset: i * itemHeight, animated: true });
      }
    },
    [itemHeight, range, onChange, maybeRecenter]
  );

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    computeFromOffset(e.nativeEvent.contentOffset.y, false);
  };

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    computeFromOffset(e.nativeEvent.contentOffset.y, true);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => {
      const active = index === visualIndex;
      return (
        <Row style={{ height: itemHeight }}>
          <Num
            style={{
              fontSize: active ? activeSize : inactiveSize,
              color: active ? BLUE : fadeColor,
              fontWeight: active ? '900' : '700',
            }}
          >
            {String(item).padStart(2, '0')}
          </Num>
        </Row>
      );
    },
    [visualIndex, itemHeight, activeSize, inactiveSize, fadeColor]
  );

  return (
    <WheelWrap style={{ width, height: itemHeight * (visiblePad * 2 + 1) }}>
      <CenterGuide pointerEvents="none" style={{ height: itemHeight }} />
      <FlatList
        ref={listRef}
        data={loopData}
        keyExtractor={(n, i) => `${n}-${i}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
        getItemLayout={(_, i) => ({ length: itemHeight, offset: itemHeight * i, index: i })}
        contentContainerStyle={{ paddingVertical: itemHeight * visiblePad }}
        // Performance:
        windowSize={5}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        removeClippedSubviews
      />
    </WheelWrap>
  );
}

/** Export del “wheel” y estilos de layout para reutilizar */
export const TimeWheel = React.memo(InfiniteWheel);

export const Section = styled.View``;

export const Label = styled.Text({
  color: BLUE,
  fontSize: 12,
  fontWeight: '900',
  marginBottom: 8,
  letterSpacing: 0.5,
});

export const TimeRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
});

export const Colon = styled.Text({
  fontSize: 48,
  lineHeight: 48,     // <- centra vertical
  color: BLUE,
  textAlignVertical: 'center',
});

const WheelWrap = styled.View({
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
});

const Row = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
});

const Num = styled.Text({});

const CenterGuide = styled.View({
  position: 'absolute',
  left: 0,
  right: 0,
  // Si quieres, añade una ligera sombra o borde para marcar la fila activa
  // borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: 'rgba(0,0,0,0.06)',
});

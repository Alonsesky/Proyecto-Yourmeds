import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  message?: string;
  spinnerColor?: string;
  backdropColor?: string;
  boxBg?: string;
  messageColor?: string;
};

export default function LoadingOverlay({
  visible,
  message = 'Cargando tus datos…',
  spinnerColor = '#FFFFFF',
  backdropColor = 'rgba(46, 30, 188, 0.15)',
  boxBg = '#0693E9',
  messageColor = '#FFFFFF',
}: Props) {
  if (!visible) return null;
  return (
    <View style={[styles.backdrop, { backgroundColor: backdropColor }]}>
      <View style={[styles.box, { backgroundColor: boxBg }]}>
        <ActivityIndicator size="large" color={spinnerColor} />
        <Text style={[styles.msg, { color: messageColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    minWidth: 220,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  msg: { fontSize: 15, textAlign: 'center' },
});
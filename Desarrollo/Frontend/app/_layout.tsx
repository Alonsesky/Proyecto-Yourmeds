import 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper'; // ⬅️ IMPORTANTE

import { AuthProvider } from './context/AuthContext';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Oswald-Regular': require('../assets/fonts/Oswald-Regular.ttf'),
    'Oswald-Bold': require('../assets/fonts/Oswald-Bold.ttf'),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {!fontsLoaded ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0693E9" />
          </View>
        ) : (
          <PaperProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </PaperProvider>
        )}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

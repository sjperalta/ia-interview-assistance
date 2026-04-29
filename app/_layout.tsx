import '#root/utils/back-handler-polyfill';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '#root/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="history/[id]" />
      </Stack>
    </NativeBaseProvider>
  );
}

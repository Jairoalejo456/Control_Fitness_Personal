import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { colors } from '@/theme/tokens';
import { useAppStore } from '@/store/appStore';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { useViewportHeightFix } from '@/hooks/useViewportHeightFix';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const onboardingDone = useAppStore((state) => state.onboardingDone);

  useAutoUpdate();
  useViewportHeightFix();

  const ready = fontsLoaded && hasHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sesion-completada" options={{ animation: 'fade' }} />
          <Stack.Screen name="administrar-ejercicios" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="rutina" options={{ animation: 'slide_from_right' }} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}

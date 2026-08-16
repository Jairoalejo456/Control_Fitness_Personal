import { PropsWithChildren, useEffect } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useIsFocused } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, spacing } from '@/theme/tokens';
import { useCssSafeArea } from '@/hooks/useCssSafeArea';
import { useIsKeyboardOpen } from '@/hooks/useIsKeyboardOpen';

// La tab bar vive en flujo normal (último hijo del flex-column, no overlay/position:fixed
// — ver comentario en src/app/(tabs)/_layout.tsx), así que ya reserva su propio espacio y
// el scroll de cada pantalla nunca queda detrás de ella. Este valor es solo un respiro
// visual extra al final del scroll, no "espacio para no tapar la tab bar".
const SCROLL_BOTTOM_BREATHING_ROOM = 20;

type Props = PropsWithChildren<{
  contentContainerStyle?: ViewStyle;
  /**
   * true solo en pantallas SIN tab bar debajo (hoy nomás onboarding) — ahí sí hace
   * falta el alto real del home indicator para no dejar el último campo pegado al
   * borde. Las pantallas con tabs ya reciben esa protección de la propia tab bar
   * (ver _layout.tsx), así que sumarla acá de nuevo solo agrega hueco de más.
   */
  bottomSafeArea?: boolean;
}>;

export function Screen({ children, contentContainerStyle, bottomSafeArea = false }: Props) {
  const { top: topInset, bottom: bottomInset } = useCssSafeArea();
  const keyboardOpen = useIsKeyboardOpen();
  const isFocused = useIsFocused();

  const progress = useSharedValue(0);

  useEffect(() => {
    if (isFocused) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: motion.screenTransitionDuration,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });
    }
  }, [isFocused, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces
      alwaysBounceVertical>
      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: topInset + spacing.xl,
            // Con el teclado abierto no hace falta la zona segura del home indicator
            // — el teclado ya ocupa ese espacio, reservarlo igual solo deja hueco muerto.
            paddingBottom: (bottomSafeArea && !keyboardOpen ? bottomInset : 0) + SCROLL_BOTTOM_BREATHING_ROOM,
          },
          animatedStyle,
          contentContainerStyle,
        ]}>
        {children}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
});

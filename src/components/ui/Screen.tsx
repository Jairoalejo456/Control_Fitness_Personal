import { PropsWithChildren, useEffect } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from 'expo-router';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, spacing } from '@/theme/tokens';
import { useBottomInset } from '@/hooks/useBottomInset';

const TAB_BAR_CLEARANCE = 90;

type Props = PropsWithChildren<{ contentContainerStyle?: ViewStyle }>;

export function Screen({ children, contentContainerStyle }: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = useBottomInset();
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
            paddingTop: insets.top + spacing.xl,
            paddingBottom: bottomInset + TAB_BAR_CLEARANCE,
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

import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';

import { colors, motion, spacing } from '@/theme/tokens';

const screenEntering = FadeInUp.duration(motion.screenTransitionDuration)
  .easing(Easing.bezier(0.22, 1, 0.36, 1))
  .withInitialValues({ transform: [{ translateY: 10 }], opacity: 0 });

type Props = PropsWithChildren<{ contentContainerStyle?: ViewStyle }>;

export function Screen({ children, contentContainerStyle }: Props) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View entering={screenEntering} style={[styles.content, contentContainerStyle]}>
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
    paddingTop: 56,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
});

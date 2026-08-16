import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion, radii } from '@/theme/tokens';

type Props = {
  progress: number; // 0..1
  height?: number;
};

export function ProgressBar({ progress, height = 6 }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const width = useSharedValue(clamped);
  // Meta cumplida se siente distinto de "en progreso" — mismo criterio de color que
  // el resto del cumplimiento semanal (ver getComplianceColor en theme/tokens).
  const fillColor = progress >= 1 ? colors.good : colors.accent;

  useEffect(() => {
    width.value = withTiming(clamped, { duration: motion.progressBarDuration });
  }, [clamped, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { borderRadius: height / 2, backgroundColor: fillColor }, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.border, overflow: 'hidden', width: '100%' },
  fill: { height: '100%' },
});

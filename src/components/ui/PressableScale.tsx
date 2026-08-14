import { PropsWithChildren } from 'react';
import { GestureResponderEvent, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PropsWithChildren<{
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}>;

export function PressableScale({ onPress, style, disabled, accessibilityLabel, children }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.pressDuration, easing: Easing.out(Easing.ease) });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.pressDuration, easing: Easing.out(Easing.ease) });
      }}
      style={[style, animatedStyle, disabled ? { opacity: 0.5 } : null]}>
      {children}
    </AnimatedPressable>
  );
}

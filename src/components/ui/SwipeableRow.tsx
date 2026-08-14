import { PropsWithChildren } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors, radii, typography } from '@/theme/tokens';

type Props = PropsWithChildren<{
  onDelete: () => void;
}>;

export function SwipeableRow({ onDelete, children }: Props) {
  return (
    <Swipeable
      rightThreshold={60}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') onDelete();
      }}
      renderRightActions={(_progress, dragX) => <DeleteBackground dragX={dragX} />}
      overshootRight={false}>
      {children}
    </Swipeable>
  );
}

function DeleteBackground({ dragX }: { dragX: Animated.AnimatedInterpolation<number> }) {
  const opacity = dragX.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  return (
    <Animated.View style={[styles.deleteBackground, { opacity }]}>
      <Text style={styles.deleteLabel}>Eliminar</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  deleteBackground: {
    backgroundColor: colors.warning,
    borderRadius: radii.buttonSm,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    flex: 1,
  },
  deleteLabel: { ...typography.body, color: colors.background, fontFamily: typography.label.fontFamily },
});

import { PropsWithChildren, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { colors, radii, typography } from '@/theme/tokens';

type Props = PropsWithChildren<{
  onDelete: () => void;
}>;

export function SwipeableRow({ onDelete, children }: Props) {
  const ref = useRef<Swipeable>(null);
  return (
    <Swipeable
      ref={ref}
      // Sin rightThreshold explícito: como el fondo "Eliminar" ocupa todo el ancho de
      // la fila (flex: 1), el valor por defecto (mitad del ancho de las acciones) cae
      // justo en la mitad de la tarjeta, que es el punto de activación pedido.
      animationOptions={{ bounciness: 8 }}
      onSwipeableOpen={(direction) => {
        if (direction !== 'right') return;
        // La lista está indexada por posición, no por un id estable de la serie —
        // al borrar, la siguiente fila hereda esta misma instancia de Swipeable. Sin
        // cerrarla primero, aparecería ya abierta (mostrando "Eliminar") con el
        // contenido de la fila que la reemplaza.
        ref.current?.close();
        onDelete();
      }}
      renderRightActions={(progress) => <DeleteBackground progress={progress} />}
      overshootRight={false}>
      {children}
    </Swipeable>
  );
}

function DeleteBackground({ progress }: { progress: Animated.AnimatedInterpolation<number> }) {
  // `progress` llega a 1 solo cuando se arrastra el ancho completo de la fila, pero el
  // punto de activación real (rightThreshold por defecto) es la mitad de ese ancho —
  // o sea progress = 0.5. Se interpola para que el fondo llegue a opacidad completa
  // justo ahí, dando una señal visual clara del punto exacto donde se soltaría para
  // eliminar.
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
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

import { useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextStyle, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { colors, radii, typography } from '@/theme/tokens';

// Cuántos px de arrastre horizontal equivalen a un "step" — bajo a propósito para
// que el gesto se sienta responsivo sin tener que arrastrar demasiado.
const PIXELS_PER_STEP = 10;

type Props = {
  value: number | null;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  min?: number;
  max?: number;
  /** Valor desde el que arranca cuando el campo está "Sin registrar" y se arrastra o edita. */
  emptyBase?: number;
  decimals?: number;
  /** Override puntual del texto del valor (p. ej. una pantalla que lo quiere más chico). */
  valueStyle?: StyleProp<TextStyle>;
};

export function Stepper({ value, step, onChange, formatValue, min, max, emptyBase = 0, decimals = 0, valueStyle }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const drag = useRef({ startValue: 0, lastEmitted: 0 });

  const clamp = (v: number) => {
    let result = v;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return Math.round(result / step) * step;
  };

  const openEdit = () => {
    setEditText(value === null ? '' : String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    setEditing(false);
    if (editText.trim() === '') return;
    const parsed = parseFloat(editText.replace(',', '.'));
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
  };

  const handleDragStart = () => {
    const start = value ?? emptyBase;
    drag.current = { startValue: start, lastEmitted: start };
  };

  const handleDragUpdate = (translationX: number) => {
    const deltaSteps = Math.round(translationX / PIXELS_PER_STEP);
    const next = clamp(drag.current.startValue + deltaSteps * step);
    if (next !== drag.current.lastEmitted) {
      drag.current.lastEmitted = next;
      onChange(next);
    }
  };

  // Arrastre horizontal = scrub. failOffsetY deja pasar el scroll vertical de la
  // pantalla si el gesto resulta ser un swipe vertical en vez de horizontal.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-10, 10])
    .onStart(() => {
      runOnJS(handleDragStart)();
    })
    .onUpdate((e) => {
      runOnJS(handleDragUpdate)(e.translationX);
    });

  // Tap sin movimiento = editar a mano. Gesture.Race deja que gane el que realmente
  // ocurra: si hay arrastre, el tap se cancela solo (y viceversa).
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(openEdit)();
  });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  const display = value === null ? 'Sin registrar' : formatValue ? formatValue(value) : value.toFixed(decimals);

  if (editing) {
    return (
      <TextInput
        autoFocus
        value={editText}
        onChangeText={(t) => setEditText(t.replace(/[^0-9.]/g, ''))}
        onBlur={commitEdit}
        onSubmitEditing={commitEdit}
        keyboardType="decimal-pad"
        selectTextOnFocus
        // fontSize fijo al final, después de valueStyle: Safari en iOS hace zoom
        // automático del viewport al enfocar un input con letra menor a 16px, y ese
        // zoom no siempre se revierte solo al cerrar el teclado — dejando la pantalla
        // deformada. valueStyle puede traer una letra más chica (para verse compacto
        // en pantalla), pero el input de edición nunca debe bajar de 16px.
        style={[styles.pill, styles.pillEditing, typography.valueLarge, valueStyle, styles.editingFontSizeGuard]}
      />
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.pill} accessibilityLabel="Arrastrar para ajustar, tocar para escribir">
        <ChevronLeft size={14} strokeWidth={2} color={colors.textSecondaryMuted} />
        <Text style={[styles.value, value === null && styles.valueEmpty, valueStyle]} numberOfLines={1}>
          {display}
        </Text>
        <ChevronRight size={14} strokeWidth={2} color={colors.textSecondaryMuted} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    minWidth: 152,
    minHeight: 44,
    borderRadius: radii.buttonSm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  pillEditing: {
    textAlign: 'center',
    color: colors.textPrimary,
    borderColor: colors.accent,
  },
  editingFontSizeGuard: { fontSize: 16 },
  value: { ...typography.valueLarge, flex: 1, textAlign: 'center' },
  valueEmpty: { color: colors.textSecondaryMuted, fontSize: 14 },
});

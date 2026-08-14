import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  value: number | null;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  min?: number;
  max?: number;
  /** Valor desde el que arranca cuando el campo está "Sin registrar" y se presiona +/-. */
  emptyBase?: number;
  decimals?: number;
};

export function Stepper({ value, step, onChange, formatValue, min, max, emptyBase = 0, decimals = 0 }: Props) {
  const clamp = (v: number) => {
    let result = v;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return Math.round(result / step) * step;
  };

  const handleDelta = (delta: number) => {
    const base = value ?? emptyBase;
    onChange(clamp(base + delta));
  };

  const display = value === null ? 'Sin registrar' : formatValue ? formatValue(value) : value.toFixed(decimals);

  return (
    <View style={styles.row}>
      <PressableScale accessibilityLabel="Disminuir" style={styles.button} onPress={() => handleDelta(-step)}>
        <Text style={styles.buttonLabel}>−</Text>
      </PressableScale>
      <Text style={[styles.value, value === null && styles.valueEmpty]} numberOfLines={1}>
        {display}
      </Text>
      <PressableScale accessibilityLabel="Aumentar" style={styles.button} onPress={() => handleDelta(step)}>
        <Text style={styles.buttonLabel}>+</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: {
    width: 32,
    height: 32,
    borderRadius: radii.buttonSm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: { ...typography.body, fontSize: 16, lineHeight: 18 },
  value: { ...typography.valueLarge, minWidth: 84, textAlign: 'center' },
  valueEmpty: { color: colors.textSecondaryMuted, fontSize: 14 },
});

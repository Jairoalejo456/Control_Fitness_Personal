import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, radii, typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: LucideIcon;
  /** 'success' = confirmación positiva (borde/texto verdes en vez de acento). */
  variant?: 'default' | 'success';
};

export function Button({ label, onPress, disabled, fullWidth = true, style, icon: Icon, variant = 'default' }: Props) {
  const tint = variant === 'success' ? colors.good : colors.accent;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, { borderColor: tint }, fullWidth && styles.fullWidth, style]}>
      {Icon ? <Icon size={16} strokeWidth={2} color={tint} /> : null}
      <Text style={[styles.label, { color: tint }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.buttonLg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullWidth: { width: '100%' },
  label: { ...typography.buttonLabel },
});

import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, disabled, fullWidth = true, style }: Props) {
  return (
    <PressableScale onPress={onPress} disabled={disabled} style={[styles.button, fullWidth && styles.fullWidth, style]}>
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radii.buttonLg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullWidth: { width: '100%' },
  label: { ...typography.buttonLabel },
});

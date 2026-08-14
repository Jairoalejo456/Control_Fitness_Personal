import { StyleSheet, TextInput } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | `${number}%`;
};

export function TextField({ value, onChange, placeholder, width }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondaryMuted}
      style={[styles.input, width ? { width } : styles.fullWidth]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.buttonSm,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
  },
  fullWidth: { width: '100%' },
});

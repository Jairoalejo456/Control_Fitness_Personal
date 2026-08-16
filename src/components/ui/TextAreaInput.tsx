import { StyleSheet, TextInput } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  minHeight?: number;
};

export function TextAreaInput({ value, onChange, placeholder, minHeight = 72 }: Props) {
  return (
    <TextInput
      value={value ?? ''}
      onChangeText={(t) => onChange(t === '' ? null : t)}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondaryMuted}
      multiline
      textAlignVertical="top"
      style={[styles.input, { minHeight }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.buttonSm,
    padding: 12,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    // 16px mínimo: por debajo de eso Safari en iOS hace zoom automático del viewport
    // al enfocar el campo, y no siempre se revierte solo al cerrar el teclado.
    fontSize: 16,
  },
});

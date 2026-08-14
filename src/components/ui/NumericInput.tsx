import { useEffect, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  width?: number;
  textAlign?: 'left' | 'center' | 'right';
  decimal?: boolean;
};

export function NumericInput({ value, onChange, placeholder = 'Sin registrar', width, textAlign = 'center', decimal = false }: Props) {
  const [text, setText] = useState(value === null ? '' : String(value));

  // Sincroniza si el valor cambia desde afuera (ej. al cambiar de fecha en "Hoy").
  useEffect(() => {
    const currentParsed = text === '' ? null : decimal ? parseFloat(text) : parseInt(text, 10);
    if (value !== currentParsed) {
      setText(value === null ? '' : String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextInput
      value={text}
      onChangeText={(t) => {
        const sanitized = decimal ? t.replace(/[^0-9.]/g, '') : t.replace(/[^0-9]/g, '');
        setText(sanitized);
        if (sanitized === '') {
          onChange(null);
        } else {
          const parsed = decimal ? parseFloat(sanitized) : parseInt(sanitized, 10);
          onChange(Number.isNaN(parsed) ? null : parsed);
        }
      }}
      keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondaryMuted}
      style={[styles.input, width ? { width } : styles.fullWidth, { textAlign }]}
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
    fontFamily: typography.valueLarge.fontFamily,
    fontSize: 16,
  },
  fullWidth: { width: '100%' },
});

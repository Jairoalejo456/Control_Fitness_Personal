import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';
import { formatDisplayDate, formatISODate } from '@/logic/dateUtils';
import type { ISODateString } from '@/types/models';

type Props = {
  value: ISODateString;
  onChange: (iso: ISODateString) => void;
  maximumDate?: Date;
};

export function DatePickerField({ value, onChange, maximumDate }: Props) {
  if (Platform.OS === 'web') {
    // El selector nativo de iOS/Android no tiene equivalente en web; se muestra de solo lectura
    // — la verificación real de este campo se hace en Expo Go sobre el iPhone.
    return (
      <View style={styles.field}>
        <Text style={styles.fieldText}>{formatDisplayDate(value)}</Text>
      </View>
    );
  }

  // Import diferido: el módulo nativo no existe en el bundle web.
  const DateTimePicker = require('@react-native-community/datetimepicker').default;

  return (
    <DateTimePicker
      value={new Date(`${value}T12:00:00`)}
      mode="date"
      display={Platform.OS === 'ios' ? 'compact' : 'default'}
      maximumDate={maximumDate}
      themeVariant="dark"
      accentColor={colors.accent}
      onChange={(_event: unknown, selectedDate?: Date) => {
        if (selectedDate) {
          onChange(formatISODate(selectedDate));
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.buttonSm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  fieldText: { ...typography.body },
});

import { Platform } from 'react-native';

import { colors } from '@/theme/tokens';
import { formatISODate } from '@/logic/dateUtils';
import type { ISODateString } from '@/types/models';
import { HtmlDateInput } from './HtmlDateInput';

type Props = {
  value: ISODateString;
  onChange: (iso: ISODateString) => void;
  maximumDate?: Date;
};

export function DatePickerField({ value, onChange, maximumDate }: Props) {
  if (Platform.OS === 'web') {
    return (
      <HtmlDateInput
        value={value}
        onChange={onChange}
        max={maximumDate ? formatISODate(maximumDate) : undefined}
      />
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

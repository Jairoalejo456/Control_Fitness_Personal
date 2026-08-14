import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';
import { PressableScale } from '@/components/ui/PressableScale';
import { addDaysISO, formatDisplayDate, isFutureDate, todayISO } from '@/logic/dateUtils';
import type { ISODateString } from '@/types/models';

type Props = {
  selectedDate: ISODateString;
  onChangeDate: (date: ISODateString) => void;
};

export function DailyLogDateHeader({ selectedDate, onChangeDate }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const isToday = selectedDate === todayISO();
  const nextDate = addDaysISO(selectedDate, 1);
  const nextDisabled = isFutureDate(nextDate);

  const DateTimePicker = Platform.OS !== 'web' ? require('@react-native-community/datetimepicker').default : null;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PressableScale accessibilityLabel="Día anterior" style={styles.arrow} onPress={() => onChangeDate(addDaysISO(selectedDate, -1))}>
          <ChevronLeft size={20} color={colors.textSecondary} />
        </PressableScale>

        <PressableScale style={styles.dateLabel} onPress={() => setShowPicker((v) => !v)}>
          <Text style={styles.kicker}>{isToday ? 'Hoy' : `Editando: ${formatDisplayDate(selectedDate)}`}</Text>
        </PressableScale>

        <PressableScale
          accessibilityLabel="Día siguiente"
          style={styles.arrow}
          disabled={nextDisabled}
          onPress={() => onChangeDate(nextDate)}>
          <ChevronRight size={20} color={nextDisabled ? colors.textSecondaryMuted : colors.textSecondary} />
        </PressableScale>
      </View>

      {!isToday ? (
        <PressableScale onPress={() => onChangeDate(todayISO())}>
          <Text style={styles.backToToday}>Volver a hoy</Text>
        </PressableScale>
      ) : null}

      {showPicker && DateTimePicker ? (
        <DateTimePicker
          value={new Date(`${selectedDate}T12:00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          themeVariant="dark"
          accentColor={colors.accent}
          onChange={(_event: { type: string }, date?: Date) => {
            if (Platform.OS !== 'ios') setShowPicker(false);
            if (date) {
              const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              onChangeDate(iso);
            }
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { padding: spacing.xs },
  dateLabel: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  kicker: { ...typography.kicker },
  backToToday: { ...typography.bodySecondary, color: colors.accent, textAlign: 'center' },
});

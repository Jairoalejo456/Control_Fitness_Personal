import { ScrollView, StyleSheet, Text } from 'react-native';

import type { WeekDay } from '@/types/models';
import { WEEK_DAY_LABELS } from '@/types/models';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import { PressableScale } from '@/components/ui/PressableScale';

type Props = {
  days: WeekDay[];
  selected: WeekDay;
  onSelect: (day: WeekDay) => void;
};

export function DayTabs({ days, selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((day) => {
        const active = day === selected;
        return (
          <PressableScale key={day} onPress={() => onSelect(day)} style={[styles.tab, active && styles.tabActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{WEEK_DAY_LABELS[day]}</Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { borderColor: colors.accent, backgroundColor: colors.accentTranslucent },
  label: { ...typography.label, color: colors.textSecondary },
  labelActive: { color: colors.accent },
});

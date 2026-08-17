import { StyleSheet, Text, View } from 'react-native';

import type { ExerciseSetEntry } from '@/types/models';
import { NumericInput } from '@/components/ui/NumericInput';
import { CheckCircleButton } from '@/components/ui/CheckCircleButton';
import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = {
  index: number;
  total: number;
  set: ExerciseSetEntry;
  placeholderKg: number | null;
  placeholderReps: number | null;
  onChange: (partial: Partial<ExerciseSetEntry>) => void;
  onToggleDone: () => void;
  onDelete: () => void;
};

export function SetRow({ index, total, set, placeholderKg, placeholderReps, onChange, onToggleDone, onDelete }: Props) {
  return (
    <SwipeableRow onDelete={onDelete}>
      <View style={styles.row}>
        <Text style={styles.setLabel}>
          Serie {index + 1}/{total}
        </Text>
        <NumericInput
          value={set.pesoKg}
          onChange={(pesoKg) => onChange({ pesoKg })}
          placeholder={placeholderKg !== null ? String(placeholderKg) : 'kg'}
          width={56}
          decimal
        />
        <View style={styles.flexInput}>
          <NumericInput
            value={set.reps}
            onChange={(reps) => onChange({ reps })}
            placeholder={placeholderReps !== null ? String(placeholderReps) : 'reps'}
          />
        </View>
        <NumericInput value={set.rir} onChange={(rir) => onChange({ rir })} placeholder="RIR" width={56} />
        <CheckCircleButton done={set.done} onPress={onToggleDone} />
      </View>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'transparent', paddingVertical: 4 },
  setLabel: { ...typography.labelSmall, width: 56 },
  flexInput: { flex: 1 },
});

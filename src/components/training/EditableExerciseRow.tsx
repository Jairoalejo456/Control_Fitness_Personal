import { StyleSheet, Text, View } from 'react-native';
import { GripVertical } from 'lucide-react-native';

import type { RoutineExercise } from '@/types/models';
import { REP_UNIT_LABELS } from '@/types/models';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { NumericInput } from '@/components/ui/NumericInput';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = {
  exercise: RoutineExercise;
  onChange: (partial: Partial<RoutineExercise>) => void;
  onDrag: () => void;
  isActive: boolean;
};

export function EditableExerciseRow({ exercise, onChange, onDrag, isActive }: Props) {
  return (
    <Card style={isActive ? styles.cardActive : undefined}>
      <View style={styles.row}>
        <PressableDragHandle onDrag={onDrag} />
        <View style={styles.fields}>
          <TextField value={exercise.nombre} onChange={(nombre) => onChange({ nombre })} />
          <View style={styles.repRow}>
            <NumericInput value={exercise.repMin} onChange={(v) => onChange({ repMin: v ?? exercise.repMin })} width={56} />
            <Text style={styles.dash}>–</Text>
            <NumericInput value={exercise.repMax} onChange={(v) => onChange({ repMax: v ?? exercise.repMax })} width={56} />
            <Text style={styles.unit}>{REP_UNIT_LABELS[exercise.unidad]}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

function PressableDragHandle({ onDrag }: { onDrag: () => void }) {
  return (
    <View onTouchStart={onDrag} style={styles.handle}>
      <GripVertical size={20} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardActive: { borderWidth: 1, borderColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  handle: { padding: spacing.xs },
  fields: { flex: 1, gap: spacing.sm },
  repRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dash: { ...typography.body },
  unit: { ...typography.bodySecondary },
});

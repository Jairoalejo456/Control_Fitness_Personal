import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import type { RoutineExercise, StrengthPlanId } from '@/types/models';
import { REP_UNIT_LABELS } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { TextField } from '@/components/ui/TextField';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppStore } from '@/store/appStore';
import { getExpectedSetCount } from '@/logic/progression';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = {
  exercise: RoutineExercise;
  index: number;
  weekIndex: number;
  plan: StrengthPlanId;
};

/**
 * Fila de la rutina de referencia: colapsada muestra solo nombre + reps (la lista
 * breve pedida), y al tocarla se abre para ver la nota técnica, el descanso y la
 * variante — divulgación progresiva en vez de mostrar todo el detalle siempre.
 */
export function RoutineExerciseRow({ exercise, index, weekIndex, plan }: Props) {
  const [expanded, setExpanded] = useState(false);
  const updateExercise = useAppStore((s) => s.updateExercise);
  const expectedCount = getExpectedSetCount(exercise, weekIndex);
  const variantEnabled = exercise.variante !== null;

  return (
    <Card>
      <PressableScale onPress={() => setExpanded((v) => !v)} style={styles.headerRow} accessibilityLabel={exercise.nombre}>
        <View style={styles.headerText}>
          <CardKicker>{`Ejercicio ${index + 1}`}</CardKicker>
          <Text style={styles.name}>{exercise.nombre}</Text>
          <Text style={styles.repRange}>
            {exercise.repMin}–{exercise.repMax} {REP_UNIT_LABELS[exercise.unidad]} · {expectedCount} series
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} strokeWidth={2} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} strokeWidth={2} color={colors.textSecondary} />
        )}
      </PressableScale>

      {expanded ? (
        <View style={styles.details}>
          {exercise.notaTecnica ? <Text style={styles.note}>{exercise.notaTecnica}</Text> : null}
          <Text style={styles.readonlyMeta}>Descanso {exercise.descanso}</Text>
          <View style={styles.variantRow}>
            <Text style={styles.variantLabel}>Añadir Variante</Text>
            <Switch value={variantEnabled} onChange={(v) => updateExercise(plan, exercise.id, { variante: v ? '' : null })} />
          </View>
          {variantEnabled ? (
            <TextField
              value={exercise.variante ?? ''}
              onChange={(text) => updateExercise(plan, exercise.id, { variante: text })}
              placeholder="Banda / variante / agarre"
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  headerText: { flex: 1, gap: 4 },
  name: { ...typography.body, fontFamily: typography.valueLarge.fontFamily, fontSize: 17 },
  repRange: { ...typography.bodySecondary },
  details: { gap: spacing.sm, marginTop: spacing.sm },
  note: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
  },
  readonlyMeta: { ...typography.bodySecondary },
  variantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  variantLabel: { ...typography.labelSmall },
});

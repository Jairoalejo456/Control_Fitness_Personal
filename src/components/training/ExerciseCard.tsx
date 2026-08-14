import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ISODateString, RoutineExercise, StrengthPlanId } from '@/types/models';
import { REP_UNIT_LABELS, exerciseSessionKey } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { SetRow } from './SetRow';
import { useAppStore } from '@/store/appStore';
import { getExpectedSetCount } from '@/logic/progression';
import { getPlaceholderForSet } from '@/logic/exerciseMemory';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = {
  mode: 'log' | 'readonly';
  exercise: RoutineExercise;
  index: number;
  weekIndex: number;
  plan: StrengthPlanId;
  fecha?: ISODateString;
};

export function ExerciseCard({ mode, exercise, index, weekIndex, plan, fecha }: Props) {
  const updateExercise = useAppStore((s) => s.updateExercise);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const exerciseDefaults = useAppStore((s) => s.exerciseDefaults);
  const setExerciseSet = useAppStore((s) => s.setExerciseSet);
  const toggleSetDone = useAppStore((s) => s.toggleSetDone);
  const addSet = useAppStore((s) => s.addSet);
  const removeSet = useAppStore((s) => s.removeSet);

  const expectedCount = getExpectedSetCount(exercise, weekIndex);
  const key = fecha ? exerciseSessionKey(fecha, plan, exercise.id) : null;
  const sets = key ? (exerciseSessions[key] ?? []) : [];

  useEffect(() => {
    if (mode === 'log' && fecha && sets.length === 0) {
      for (let i = 0; i < expectedCount; i++) addSet(fecha, plan, exercise.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, fecha, plan, exercise.id]);

  const variantEnabled = exercise.variante !== null;

  return (
    <Card>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <CardKicker>{`Ejercicio ${index + 1}`}</CardKicker>
          <Text style={styles.name}>{exercise.nombre}</Text>
          <Text style={styles.repRange}>
            {exercise.repMin}–{exercise.repMax} {REP_UNIT_LABELS[exercise.unidad]}
          </Text>
        </View>
        <View style={styles.variantColumn}>
          <Text style={styles.variantLabel}>Añadir Variante</Text>
          <Switch value={variantEnabled} onChange={(v) => updateExercise(plan, exercise.id, { variante: v ? '' : null })} />
        </View>
      </View>

      {variantEnabled ? (
        <TextField
          value={exercise.variante ?? ''}
          onChange={(text) => updateExercise(plan, exercise.id, { variante: text })}
          placeholder="Banda / variante / agarre"
        />
      ) : null}

      {exercise.notaTecnica ? <Text style={styles.note}>{exercise.notaTecnica}</Text> : null}

      {mode === 'readonly' ? (
        <Text style={styles.readonlyMeta}>
          Series recomendadas: {expectedCount} · Descanso {exercise.descanso}
        </Text>
      ) : (
        <View style={styles.sets}>
          {sets.map((set, i) => (
            <SetRow
              key={i}
              index={i}
              set={set}
              placeholderKg={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, i).pesoKg}
              placeholderReps={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, i).reps}
              onChange={(partial) => fecha && setExerciseSet(fecha, plan, exercise.id, i, partial)}
              onToggleDone={() => fecha && toggleSetDone(fecha, plan, exercise.id, i)}
              onDelete={() => fecha && removeSet(fecha, plan, exercise.id, i)}
            />
          ))}
          <Button
            label="+ agregar serie"
            fullWidth
            onPress={() => fecha && addSet(fecha, plan, exercise.id)}
            style={styles.addSetButton}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  name: { ...typography.body, fontFamily: typography.valueLarge.fontFamily, fontSize: 15 },
  repRange: { ...typography.bodySecondary },
  variantColumn: { width: 78, alignItems: 'flex-start', gap: 6 },
  variantLabel: { ...typography.labelSmall, fontSize: 10 },
  note: { ...typography.bodySecondary, color: colors.textSecondary, borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 8 },
  readonlyMeta: { ...typography.bodySecondary },
  sets: { gap: spacing.sm },
  addSetButton: { borderStyle: 'dashed' },
});

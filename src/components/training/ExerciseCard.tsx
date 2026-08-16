import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleCheck, Trophy } from 'lucide-react-native';

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
import { getPersonalRecord } from '@/logic/personalRecords';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = {
  exercise: RoutineExercise;
  index: number;
  weekIndex: number;
  plan: StrengthPlanId;
  fecha: ISODateString;
};

/**
 * Sesión activa: en vez de mostrar todas las series de todos los ejercicios a la
 * vez, cada tarjeta se enfoca en la serie actual (con el peso anterior como
 * placeholder y el récord personal a la vista), resume las series ya hechas en una
 * línea, y se colapsa a una tarjeta chica una vez que el ejercicio queda completo.
 */
export function ExerciseCard({ exercise, index, weekIndex, plan, fecha }: Props) {
  const updateExercise = useAppStore((s) => s.updateExercise);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const exerciseDefaults = useAppStore((s) => s.exerciseDefaults);
  const setExerciseSet = useAppStore((s) => s.setExerciseSet);
  const toggleSetDone = useAppStore((s) => s.toggleSetDone);
  const addSet = useAppStore((s) => s.addSet);
  const removeSet = useAppStore((s) => s.removeSet);

  const expectedCount = getExpectedSetCount(exercise, weekIndex);
  const key = exerciseSessionKey(fecha, plan, exercise.id);
  const sets = exerciseSessions[key] ?? [];

  useEffect(() => {
    if (sets.length === 0) {
      for (let i = 0; i < expectedCount; i++) addSet(fecha, plan, exercise.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, plan, exercise.id]);

  const record = useMemo(
    () => getPersonalRecord(exerciseSessions, plan, exercise.id),
    [exerciseSessions, plan, exercise.id],
  );

  const variantEnabled = exercise.variante !== null;
  const allDone = sets.length > 0 && sets.every((s) => s.done);
  const currentIndex = sets.findIndex((s) => !s.done);

  if (allDone) {
    const best = sets.reduce<{ pesoKg: number; reps: number } | null>((acc, s) => {
      if (s.pesoKg === null || s.reps === null) return acc;
      if (!acc || s.pesoKg > acc.pesoKg) return { pesoKg: s.pesoKg, reps: s.reps };
      return acc;
    }, null);
    return (
      <Card style={styles.completedCard}>
        <View style={styles.completedRow}>
          <CircleCheck size={18} strokeWidth={2} color={colors.good} />
          <Text style={styles.completedName}>{exercise.nombre}</Text>
        </View>
        {best ? (
          <Text style={styles.completedMeta}>
            Mejor serie de hoy: {best.pesoKg}kg × {best.reps}
          </Text>
        ) : null}
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
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

      {record ? (
        <View style={styles.recordRow}>
          <Trophy size={14} strokeWidth={2} color={colors.caution} />
          <Text style={styles.recordText}>
            Récord personal: {record.pesoKg}kg × {record.reps}
          </Text>
        </View>
      ) : null}

      {sets.some((s) => s.done) ? (
        <View style={styles.doneList}>
          {sets.map((set, i) =>
            set.done ? (
              <Text key={i} style={styles.doneRow}>
                Serie {i + 1} — {set.pesoKg ?? '—'}kg × {set.reps ?? '—'} ✓
              </Text>
            ) : null,
          )}
        </View>
      ) : null}

      {currentIndex >= 0 ? (
        <SetRow
          index={currentIndex}
          set={sets[currentIndex]}
          placeholderKg={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, currentIndex).pesoKg}
          placeholderReps={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, currentIndex).reps}
          onChange={(partial) => setExerciseSet(fecha, plan, exercise.id, currentIndex, partial)}
          onToggleDone={() => toggleSetDone(fecha, plan, exercise.id, currentIndex)}
          onDelete={() => removeSet(fecha, plan, exercise.id, currentIndex)}
        />
      ) : null}

      <Button label="+ agregar serie" fullWidth onPress={() => addSet(fecha, plan, exercise.id)} style={styles.addSetButton} />
    </Card>
  );
}

const styles = StyleSheet.create({
  // Un poco más grandes que el resto de las tarjetas de la app, a propósito — acá lo
  // que importa es leer bien el ejercicio, no la densidad de información.
  card: { padding: spacing.lg + 4, gap: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, gap: 4 },
  name: { ...typography.body, fontFamily: typography.valueLarge.fontFamily, fontSize: 18 },
  repRange: { ...typography.bodySecondary, fontSize: 14 },
  variantColumn: { width: 78, alignItems: 'flex-start', gap: 6 },
  variantLabel: { ...typography.labelSmall, fontSize: 10 },
  note: {
    ...typography.bodySecondary,
    fontSize: 14,
    color: colors.textSecondary,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
  },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recordText: { ...typography.labelSmall, color: colors.caution },
  doneList: { gap: 2 },
  doneRow: { ...typography.bodySecondary, color: colors.good },
  addSetButton: { borderStyle: 'dashed' },
  completedCard: { gap: 4, paddingVertical: spacing.md },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedName: { ...typography.body },
  completedMeta: { ...typography.bodySecondary },
});

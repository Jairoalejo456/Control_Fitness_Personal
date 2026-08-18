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
 * Todas las series de un ejercicio están siempre visibles y editables (peso, reps,
 * RIR, hecha/no hecha) — nada se oculta ni se colapsa. Deslizar una serie hacia la
 * izquierda más de la mitad de la tarjeta la elimina.
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

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <CardKicker>{`Ejercicio ${index + 1}`}</CardKicker>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{exercise.nombre}</Text>
            {allDone ? <CircleCheck size={18} strokeWidth={2} color={colors.good} /> : null}
          </View>
          <Text style={styles.repRange}>
            {exercise.repMin}–{exercise.repMax} {REP_UNIT_LABELS[exercise.unidad]} · {sets.length}{' '}
            {sets.length === 1 ? 'serie' : 'series'}
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

      <View style={styles.setsList}>
        {sets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            total={sets.length}
            set={set}
            placeholderKg={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, i).pesoKg}
            placeholderReps={getPlaceholderForSet(exerciseDefaults, plan, exercise.id, i).reps}
            onChange={(partial) => setExerciseSet(fecha, plan, exercise.id, i, partial)}
            onToggleDone={() => toggleSetDone(fecha, plan, exercise.id, i)}
            onDelete={() => removeSet(fecha, plan, exercise.id, i)}
          />
        ))}
      </View>

      {sets.length > 0 ? (
        <Text style={styles.deleteHint}>Desliza una serie hacia la izquierda para eliminarla</Text>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  setsList: { gap: 4 },
  deleteHint: { ...typography.labelSmall, color: colors.textSecondary, textAlign: 'center' },
  addSetButton: { borderStyle: 'dashed' },
});

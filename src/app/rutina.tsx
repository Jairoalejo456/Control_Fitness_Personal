import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { DayTabs } from '@/components/training/DayTabs';
import { WarmupCard } from '@/components/training/WarmupCard';
import { RoutineExerciseRow } from '@/components/training/RoutineExerciseRow';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppStore } from '@/store/appStore';
import { useUiStore } from '@/store/uiStore';
import { DAY_SCHEDULE, WEEK_DAYS } from '@/types/models';
import { PROGRESSION_NOTES } from '@/data/routineSeed';
import { getWeekIndexForDate, todayISO } from '@/logic/dateUtils';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RutinaScreen() {
  const config = useAppStore((s) => s.config);
  const customRoutine = useAppStore((s) => s.customRoutine);
  const customCardioDesc = useAppStore((s) => s.customCardioDesc);

  const selectedDay = useUiStore((s) => s.rutinaSelectedDay);
  const setSelectedDay = useUiStore((s) => s.setRutinaSelectedDay);

  const weekIndex = Math.max(1, getWeekIndexForDate(todayISO(), config.fechaInicioPlan));
  const activity = DAY_SCHEDULE[selectedDay];
  const exercises = activity.type === 'fuerza' ? customRoutine[activity.plan] : [];
  const planLabel = activity.type === 'fuerza' ? activity.planName : activity.type === 'cardio' ? activity.planName : 'Descanso';
  const isFuerza = activity.type === 'fuerza';

  const progressionCard = (
    <Card>
      <CardKicker>Progresiones</CardKicker>
      <Text style={typography.bodySecondary}>{PROGRESSION_NOTES.general}</Text>
      <Text style={typography.bodySecondary}>{PROGRESSION_NOTES.dominadas}</Text>
      <Text style={typography.bodySecondary}>{PROGRESSION_NOTES.flexiones}</Text>
    </Card>
  );

  return (
    <Screen bottomSafeArea contentContainerStyle={isFuerza ? undefined : styles.fillContainer}>
      <PressableScale onPress={() => router.back()} style={styles.backRow} accessibilityLabel="Volver a Entreno">
        <ArrowLeft size={18} strokeWidth={2} color={colors.textSecondary} />
        <Text style={styles.backLabel}>Entreno</Text>
      </PressableScale>

      <ScreenTitle kicker="Referencia" title="Rutina oficial" subtitle="Recomposición corporal · 16 semanas" />

      <DayTabs days={WEEK_DAYS} selected={selectedDay} onSelect={setSelectedDay} />

      <Text style={styles.planLabel}>{planLabel}</Text>

      {isFuerza ? (
        <>
          <WarmupCard />
          {exercises.map((exercise, index) => (
            <RoutineExerciseRow key={exercise.id} exercise={exercise} index={index} weekIndex={weekIndex} plan={activity.plan} />
          ))}
          {progressionCard}
        </>
      ) : (
        <View style={styles.centeredFill}>
          <View style={styles.stackGap}>
            {activity.type === 'cardio' ? (
              <Card>
                <CardKicker>{activity.obligatorio ? 'Cardio obligatorio' : 'Cardio opcional'}</CardKicker>
                <Text style={typography.body}>{customCardioDesc[activity.plan]}</Text>
              </Card>
            ) : null}

            {activity.type === 'descanso' ? (
              <Card>
                <Text style={typography.body}>Día de descanso. No hay entrenamiento programado.</Text>
              </Card>
            ) : null}

            {progressionCard}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backLabel: { ...typography.body, color: colors.textSecondary },
  planLabel: { ...typography.valueLarge },
  fillContainer: { flex: 1 },
  centeredFill: { flex: 1, justifyContent: 'center' },
  stackGap: { gap: spacing.lg },
});

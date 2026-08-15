import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { WarmupCard } from '@/components/training/WarmupCard';
import { SessionProgressCard } from '@/components/training/SessionProgressCard';
import { ExerciseCard } from '@/components/training/ExerciseCard';
import { useAppStore } from '@/store/appStore';
import { DAY_SCHEDULE, EMPTY_DAILY_LOG, WEEK_DAY_FULL_LABELS } from '@/types/models';
import { getWeekDayName, getWeekIndexForDate, todayISO } from '@/logic/dateUtils';
import { getSessionProgress, isSessionComplete } from '@/logic/sessionProgress';
import { typography } from '@/theme/tokens';

export default function EntrenoScreen() {
  const today = todayISO();
  const config = useAppStore((s) => s.config);
  const customRoutine = useAppStore((s) => s.customRoutine);
  const customCardioDesc = useAppStore((s) => s.customCardioDesc);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const upsertDailyLog = useAppStore((s) => s.upsertDailyLog);

  const weekDay = getWeekDayName(today);
  const weekIndex = Math.max(1, getWeekIndexForDate(today, config.fechaInicioPlan));
  const activity = DAY_SCHEDULE[weekDay];
  const log = dailyLogs[today] ?? EMPTY_DAILY_LOG;

  const exercises = activity.type === 'fuerza' ? customRoutine[activity.plan] : [];
  const progress =
    activity.type === 'fuerza'
      ? getSessionProgress(
          exerciseSessions,
          today,
          activity.plan,
          exercises.map((e) => e.id),
        )
      : { done: 0, total: 0 };

  const prevCompleteRef = useRef(false);
  useEffect(() => {
    const complete = activity.type === 'fuerza' && isSessionComplete(progress);
    if (complete && !prevCompleteRef.current) {
      router.replace('/sesion-completada');
    }
    prevCompleteRef.current = complete;
  }, [activity.type, progress.done, progress.total]);

  const planLabel = activity.type === 'fuerza' ? activity.planName : activity.type === 'cardio' ? activity.planName : 'Descanso';
  const isFuerza = activity.type === 'fuerza';

  return (
    <Screen contentContainerStyle={isFuerza ? undefined : styles.fillContainer}>
      <ScreenTitle kicker={`Semana ${weekIndex} · ${WEEK_DAY_FULL_LABELS[weekDay]}`} title="Entrenamiento" subtitle={planLabel} />

      {activity.type === 'fuerza' ? (
        <>
          <WarmupCard />
          <SessionProgressCard done={progress.done} total={progress.total} />
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              mode="log"
              exercise={exercise}
              index={index}
              weekIndex={weekIndex}
              plan={activity.plan}
              fecha={today}
            />
          ))}
        </>
      ) : null}

      {activity.type === 'cardio' ? (
        <View style={styles.centeredFill}>
          <Card>
            <CardKicker>{activity.obligatorio ? 'Cardio obligatorio' : 'Cardio opcional'}</CardKicker>
            <Text style={typography.body}>{customCardioDesc[activity.plan]}</Text>
            <Stepper
              value={log.cardioMin}
              step={5}
              formatValue={(v) => `${v} min`}
              onChange={(cardioMin) => upsertDailyLog(today, { cardioMin })}
            />
          </Card>
        </View>
      ) : null}

      {activity.type === 'descanso' ? (
        <View style={styles.centeredFill}>
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Día de descanso</Text>
            <Text style={styles.restText}>Hoy toca descansar. Aprovecha para recuperarte bien.</Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fillContainer: { flex: 1 },
  centeredFill: { flex: 1, justifyContent: 'center' },
  restContainer: { alignItems: 'center', gap: 8 },
  restTitle: { ...typography.valueLarge },
  restText: { ...typography.bodySecondary, textAlign: 'center' },
});

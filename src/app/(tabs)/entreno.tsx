import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { ChevronRow } from '@/components/ui/ChevronRow';
import { Stepper } from '@/components/ui/Stepper';
import { WarmupCard } from '@/components/training/WarmupCard';
import { SessionProgressCard } from '@/components/training/SessionProgressCard';
import { ExerciseCard } from '@/components/training/ExerciseCard';
import { useAppStore } from '@/store/appStore';
import { useUiStore } from '@/store/uiStore';
import { DAY_SCHEDULE, EMPTY_DAILY_LOG, WEEK_DAY_FULL_LABELS } from '@/types/models';
import { getWeekDayName, getWeekIndexForDate } from '@/logic/dateUtils';
import { getSessionProgress, isSessionComplete } from '@/logic/sessionProgress';
import { typography } from '@/theme/tokens';

export default function EntrenoScreen() {
  // Antes usaba todayISO() (fecha real del sistema), ignorando el día elegido en
  // Hoy — por eso elegir viernes ahí y abrir Entreno mostraba domingo. Ambas
  // pantallas comparten el mismo día seleccionado.
  const today = useUiStore((s) => s.hoySelectedDate);
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
  // Al cambiar de día (ahora que "today" puede ser cualquier fecha elegida en Hoy,
  // no solo la real) hay que sincronizar la referencia al estado real de ESE día
  // antes de que el efecto de abajo la compare — si no, cambiar a un día que ya
  // estaba completo se interpretaría como una transición recién ocurrida y
  // redirigiría a "sesión completada" sin que el usuario haya hecho nada.
  useEffect(() => {
    prevCompleteRef.current = activity.type === 'fuerza' && isSessionComplete(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

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

      <ChevronRow label="Ver rutina completa" onPress={() => router.push('/rutina')} />

      {activity.type === 'fuerza' ? (
        <>
          <WarmupCard />
          <SessionProgressCard done={progress.done} total={progress.total} />
          {exercises.map((exercise, index) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={index} weekIndex={weekIndex} plan={activity.plan} fecha={today} />
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
        <Card>
          <CardKicker>Día de descanso</CardKicker>
          <Text style={typography.body}>Hoy toca descansar. Aprovecha para recuperarte bien.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fillContainer: { flex: 1 },
  centeredFill: { flex: 1, justifyContent: 'center' },
});

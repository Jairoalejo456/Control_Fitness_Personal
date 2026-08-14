import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { FieldRow } from '@/components/ui/FieldRow';
import { Stepper } from '@/components/ui/Stepper';
import { NumericInput } from '@/components/ui/NumericInput';
import { TextAreaInput } from '@/components/ui/TextAreaInput';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DailyLogDateHeader } from '@/components/daily/DailyLogDateHeader';
import { useAppStore } from '@/store/appStore';
import { useUiStore } from '@/store/uiStore';
import { EMPTY_DAILY_LOG, DAY_SCHEDULE, WEEK_DAY_FULL_LABELS } from '@/types/models';
import { getWeekDayName, getWeekIndexForDate, formatDisplayDate } from '@/logic/dateUtils';
import { getStepGoalForWeek } from '@/data/stepGoals';
import { getSessionProgress, isSessionComplete } from '@/logic/sessionProgress';
import { colors, spacing, typography } from '@/theme/tokens';

export default function HoyScreen() {
  const selectedDate = useUiStore((s) => s.hoySelectedDate);
  const setSelectedDate = useUiStore((s) => s.setHoySelectedDate);

  const config = useAppStore((s) => s.config);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const upsertDailyLog = useAppStore((s) => s.upsertDailyLog);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const customRoutine = useAppStore((s) => s.customRoutine);

  const log = dailyLogs[selectedDate] ?? EMPTY_DAILY_LOG;
  const weekDay = getWeekDayName(selectedDate);
  const weekIndex = Math.max(1, getWeekIndexForDate(selectedDate, config.fechaInicioPlan));
  const activity = DAY_SCHEDULE[weekDay];
  const stepGoal = getStepGoalForWeek(weekIndex);

  const planLabel =
    activity.type === 'fuerza' ? activity.planName : activity.type === 'cardio' ? activity.planName : 'Descanso';

  const update = (partial: Partial<typeof log>) => upsertDailyLog(selectedDate, partial);

  const pasosProgress = log.pasos !== null ? log.pasos / stepGoal : 0;
  const caloriasDelta =
    log.calorias === null ? null : log.calorias - config.caloriasObjetivo;

  let strengthBadge: { label: string; active: boolean } | null = null;
  if (activity.type === 'fuerza') {
    const exerciseIds = customRoutine[activity.plan].map((e) => e.id);
    const progress = getSessionProgress(exerciseSessions, selectedDate, activity.plan, exerciseIds);
    strengthBadge = isSessionComplete(progress)
      ? { label: 'Entrenamiento completado', active: true }
      : { label: `Fuerza: ${progress.done}/${progress.total} series`, active: false };
  }

  return (
    <Screen>
      <ScreenTitle
        kicker={`Semana ${weekIndex} · ${WEEK_DAY_FULL_LABELS[weekDay]}`}
        title="Registro diario"
        subtitle={`${formatDisplayDate(selectedDate)} · Plan: ${planLabel}`}
      />

      <DailyLogDateHeader selectedDate={selectedDate} onChangeDate={setSelectedDate} />

      <Card>
        <FieldRow label="Peso corporal">
          <Stepper value={log.pesoKg} step={0.05} formatValue={(v) => `${v.toFixed(2)} kg`} onChange={(pesoKg) => update({ pesoKg })} />
        </FieldRow>
      </Card>

      <Card>
        <FieldRow label="Cintura">
          <Stepper value={log.cinturaCm} step={0.5} formatValue={(v) => `${v.toFixed(1)} cm`} onChange={(cinturaCm) => update({ cinturaCm })} />
        </FieldRow>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>Pasos</Text>
          <Text style={styles.metaText}>meta {stepGoal}</Text>
        </View>
        <View style={styles.pasosRow}>
          <Stepper value={log.pasos} step={500} emptyBase={0} onChange={(pasos) => update({ pasos })} formatValue={(v) => `${v}`} />
        </View>
        <ProgressBar progress={pasosProgress} />
      </Card>

      <Card>
        <FieldRow label={`Sueño / ${config.suenoIdealH} h`}>
          <Stepper value={log.suenoH} step={0.5} formatValue={(v) => `${v} h`} onChange={(suenoH) => update({ suenoH })} />
        </FieldRow>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>Calorías</Text>
          <Text style={styles.valueLarge}>{log.calorias === null ? 'Sin registrar' : `${log.calorias} kcal`}</Text>
        </View>
        <NumericInput value={log.calorias} onChange={(calorias) => update({ calorias })} textAlign="left" />
        <Text style={styles.metaText}>
          Objetivo {config.caloriasObjetivo} kcal ·{' '}
          <Text style={styles.accentText}>
            {caloriasDelta === null ? 'Sin registrar' : `${caloriasDelta > 0 ? '+' : ''}${caloriasDelta}`}
          </Text>
        </Text>
      </Card>

      <Card>
        <FieldRow label={`Proteína / ${config.proteinaIdealG} g`}>
          <Stepper value={log.proteinaG} step={10} formatValue={(v) => `${v} g`} onChange={(proteinaG) => update({ proteinaG })} />
        </FieldRow>
      </Card>

      <View style={styles.twoColumns}>
        <Card style={styles.halfCard}>
          <Text style={styles.fieldLabel}>Cardio</Text>
          <Stepper value={log.cardioMin} step={5} formatValue={(v) => `${v} min`} onChange={(cardioMin) => update({ cardioMin })} />
        </Card>
        <Card style={styles.halfCard}>
          <Text style={styles.fieldLabel}>Energía</Text>
          <Stepper value={log.energia} step={1} min={1} max={10} formatValue={(v) => `${v}/10`} onChange={(energia) => update({ energia })} />
        </Card>
      </View>

      <Card>
        <Text style={styles.fieldLabel}>Notas</Text>
        <TextAreaInput value={log.notas} onChange={(notas) => update({ notas })} placeholder="Sensaciones, dolores, ajustes…" />
      </Card>

      {strengthBadge ? <Badge label={strengthBadge.label} active={strengthBadge.active} /> : null}

      <Button label="Marcar día como registrado" onPress={() => update({ dayLogged: true })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { ...typography.body },
  metaText: { ...typography.bodySecondary },
  accentText: { color: colors.accent },
  valueLarge: { ...typography.valueLarge },
  pasosRow: { alignItems: 'center' },
  twoColumns: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1 },
});

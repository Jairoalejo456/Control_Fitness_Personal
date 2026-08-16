import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Beef,
  CircleCheck,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Moon,
  NotebookPen,
  Ruler,
  Scale,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { ChevronRow } from '@/components/ui/ChevronRow';
import { FieldRow } from '@/components/ui/FieldRow';
import { Stepper } from '@/components/ui/Stepper';
import { NumericInput } from '@/components/ui/NumericInput';
import { TextAreaInput } from '@/components/ui/TextAreaInput';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DetailsToggle } from '@/components/ui/DetailsToggle';
import { DailyLogDateHeader } from '@/components/daily/DailyLogDateHeader';
import { useAppStore } from '@/store/appStore';
import { useUiStore } from '@/store/uiStore';
import { usePanelData } from '@/hooks/usePanelData';
import { EMPTY_DAILY_LOG, DAY_SCHEDULE, WEEK_DAY_FULL_LABELS } from '@/types/models';
import { getWeekDayName, getWeekIndexForDate, formatDisplayDate } from '@/logic/dateUtils';
import { getStepGoalForWeek } from '@/data/stepGoals';
import { getSessionProgress, isSessionComplete } from '@/logic/sessionProgress';
import { colors, getComplianceColor, typography } from '@/theme/tokens';

export default function HoyScreen() {
  const [showDetails, setShowDetails] = useState(false);
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

  const { currentWeekMetrics } = usePanelData();
  const overallPct =
    currentWeekMetrics.overallCompliance.kind === 'datos-insuficientes' ? null : currentWeekMetrics.overallCompliance.pct;
  const overallText = overallPct === null ? 'Datos insuficientes' : `${Math.round(overallPct * 100)}%`;

  return (
    <Screen>
      <ScreenTitle
        kicker={`Semana ${weekIndex} · ${WEEK_DAY_FULL_LABELS[weekDay]}`}
        title="Registro diario"
        subtitle={`${formatDisplayDate(selectedDate)} · Plan: ${planLabel}`}
      />

      <DailyLogDateHeader selectedDate={selectedDate} onChangeDate={setSelectedDate} />

      <Card>
        <CardKicker icon={Scale}>Cuerpo</CardKicker>
        <FieldRow label="Peso corporal" icon={Scale}>
          <Stepper
            value={log.pesoKg}
            step={0.05}
            formatValue={(v) => `${v.toFixed(2)} kg`}
            onChange={(pesoKg) => update({ pesoKg })}
            valueStyle={styles.compactValue}
          />
        </FieldRow>
        <FieldRow label="Cintura" icon={Ruler}>
          <Stepper
            value={log.cinturaCm}
            step={0.5}
            formatValue={(v) => `${v.toFixed(1)} cm`}
            onChange={(cinturaCm) => update({ cinturaCm })}
            valueStyle={styles.compactValue}
          />
        </FieldRow>
      </Card>

      <Card>
        <CardKicker icon={Dumbbell}>Entrenamiento</CardKicker>
        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>{planLabel}</Text>
          {strengthBadge ? <Badge label={strengthBadge.label} active={strengthBadge.active} /> : null}
        </View>
        <ChevronRow label="Ir a Entreno" onPress={() => router.push('/entreno')} />
      </Card>

      <Card>
        <CardKicker icon={TrendingUp}>Progreso</CardKicker>
        <View style={styles.rowBetween}>
          <Text style={styles.fieldLabel}>Cumplimiento esta semana</Text>
          <Text style={[styles.valueLarge, overallPct !== null && { color: getComplianceColor(overallPct) }]}>{overallText}</Text>
        </View>
        <ChevronRow label="Ir a Progreso" onPress={() => router.push('/progreso')} />
      </Card>

      <DetailsToggle expanded={showDetails} onToggle={() => setShowDetails((v) => !v)} />

      {showDetails ? (
        <>
          <Card>
            <CardKicker icon={Footprints}>Actividad</CardKicker>
            <View style={styles.rowBetween}>
              <View style={styles.labelRow}>
                <Footprints size={15} strokeWidth={1.75} color={colors.textSecondary} />
                <Text style={styles.fieldLabel}>Pasos</Text>
              </View>
              <Text style={styles.metaText}>meta {stepGoal}</Text>
            </View>
            <View style={styles.pasosRow}>
              <Stepper
                value={log.pasos}
                step={500}
                emptyBase={0}
                onChange={(pasos) => update({ pasos })}
                formatValue={(v) => `${v}`}
                valueStyle={styles.compactValue}
              />
            </View>
            <ProgressBar progress={pasosProgress} />
            <FieldRow label={`Sueño / ${config.suenoIdealH} h`} icon={Moon}>
              <Stepper
                value={log.suenoH}
                step={0.5}
                formatValue={(v) => `${v} h`}
                onChange={(suenoH) => update({ suenoH })}
                valueStyle={styles.compactValue}
              />
            </FieldRow>
            <FieldRow label="Cardio" icon={HeartPulse}>
              <Stepper
                value={log.cardioMin}
                step={5}
                formatValue={(v) => `${v} min`}
                onChange={(cardioMin) => update({ cardioMin })}
                valueStyle={styles.compactValue}
              />
            </FieldRow>
            <FieldRow label="Energía" icon={Zap}>
              <Stepper
                value={log.energia}
                step={1}
                min={1}
                max={10}
                formatValue={(v) => `${v}/10`}
                onChange={(energia) => update({ energia })}
                valueStyle={styles.compactValue}
              />
            </FieldRow>
          </Card>

          <Card>
            <CardKicker icon={Utensils}>Nutrición</CardKicker>
            <View style={styles.rowBetween}>
              <View style={styles.labelRow}>
                <Flame size={15} strokeWidth={1.75} color={colors.textSecondary} />
                <Text style={styles.fieldLabel}>Calorías</Text>
              </View>
              <Text style={styles.valueLarge}>{log.calorias === null ? 'Sin registrar' : `${log.calorias} kcal`}</Text>
            </View>
            <NumericInput value={log.calorias} onChange={(calorias) => update({ calorias })} textAlign="left" />
            <Text style={styles.metaText}>
              Objetivo {config.caloriasObjetivo} kcal ·{' '}
              <Text style={styles.accentText}>
                {caloriasDelta === null ? 'Sin registrar' : `${caloriasDelta > 0 ? '+' : ''}${caloriasDelta}`}
              </Text>
            </Text>
            <FieldRow label={`Proteína / ${config.proteinaIdealG} g`} icon={Beef}>
              <Stepper
                value={log.proteinaG}
                step={10}
                formatValue={(v) => `${v} g`}
                onChange={(proteinaG) => update({ proteinaG })}
                valueStyle={styles.compactValue}
              />
            </FieldRow>
          </Card>

          <Card>
            <View style={styles.labelRow}>
              <NotebookPen size={15} strokeWidth={1.75} color={colors.textSecondary} />
              <Text style={styles.fieldLabel}>Notas</Text>
            </View>
            <TextAreaInput value={log.notas} onChange={(notas) => update({ notas })} placeholder="Sensaciones, dolores, ajustes…" />
          </Card>
        </>
      ) : null}

      <Button
        label={log.dayLogged ? 'Día registrado' : 'Marcar día como registrado'}
        icon={log.dayLogged ? CircleCheck : undefined}
        variant={log.dayLogged ? 'success' : 'default'}
        onPress={() => update({ dayLogged: !log.dayLogged })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldLabel: { ...typography.body },
  metaText: { ...typography.bodySecondary },
  accentText: { color: colors.accent },
  valueLarge: { ...typography.valueLarge, fontSize: 15 },
  compactValue: { fontSize: 15 },
  pasosRow: { alignItems: 'center' },
});

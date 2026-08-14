import type {
  CustomRoutineMap,
  DailyLog,
  DailyLogsMap,
  ExerciseSessionsMap,
  ISODateString,
  MetricAverage,
  UserConfig,
  WeekDay,
} from '@/types/models';
import { DAY_SCHEDULE, WEEK_DAYS } from '@/types/models';
import { computeMetricAverage } from './averages';
import { computeGoalCompliance, computeOverallCompliance, computeStrengthCompliance, type OverallComplianceResult } from './compliance';
import { getDatesInRange, getWeekDateRange, getWeekDayName } from './dateUtils';
import { getSessionProgress, isSessionComplete } from './sessionProgress';
import { dailyLogHasAnyData } from './weekStatus';
import { getStepGoalForWeek } from '@/data/stepGoals';

const STRENGTH_DAYS: WeekDay[] = WEEK_DAYS.filter((d) => DAY_SCHEDULE[d].type === 'fuerza');

export interface WeekMetrics {
  weekIndex: number;
  startDate: ISODateString;
  endDate: ISODateString;
  peso: MetricAverage;
  cintura: MetricAverage;
  pasos: MetricAverage;
  sueno: MetricAverage;
  calorias: MetricAverage;
  proteina: MetricAverage;
  pasosCompliance: number | null;
  suenoCompliance: number | null;
  caloriasCompliance: number | null;
  proteinaCompliance: number | null;
  strengthCompliance: number | null;
  strengthCompletedSessions: number;
  strengthProgrammedSessions: number;
  cardioMinutes: number;
  overallCompliance: OverallComplianceResult;
  daysWithAnyDataPct: number;
  hasAnyDataThisWeek: boolean;
}

export function computeWeekMetrics(
  weekIndex: number,
  config: UserConfig,
  dailyLogs: DailyLogsMap,
  exerciseSessions: ExerciseSessionsMap,
  customRoutine: CustomRoutineMap,
): WeekMetrics {
  const { start, end } = getWeekDateRange(weekIndex, config.fechaInicioPlan);
  const dates = getDatesInRange(start, end);
  const logs: DailyLog[] = dates.map((d) => dailyLogs[d]).filter((l): l is DailyLog => !!l);

  const stepGoal = getStepGoalForWeek(weekIndex);

  const peso = computeMetricAverage(logs, 'pesoKg');
  const cintura = computeMetricAverage(logs, 'cinturaCm');
  const pasos = computeMetricAverage(logs, 'pasos');
  const sueno = computeMetricAverage(logs, 'suenoH');
  const calorias = computeMetricAverage(logs, 'calorias');
  const proteina = computeMetricAverage(logs, 'proteinaG');

  const pasosCompliance = computeGoalCompliance(logs, 'pasos', (v) => v >= stepGoal);
  const suenoCompliance = computeGoalCompliance(logs, 'suenoH', (v) => v >= config.suenoMinH);
  const caloriasCompliance = computeGoalCompliance(
    logs,
    'calorias',
    (v) => Math.abs(v - config.caloriasObjetivo) <= config.caloriasTolerancia,
  );
  const proteinaCompliance = computeGoalCompliance(logs, 'proteinaG', (v) => v >= config.proteinaMinG);

  let strengthCompleted = 0;
  for (const day of STRENGTH_DAYS) {
    const activity = DAY_SCHEDULE[day];
    if (activity.type !== 'fuerza') continue;
    // El bloque de 7 fechas incluye cada día de la semana calendario exactamente una vez.
    const targetDate = dates.find((d) => getWeekDayName(d) === day);
    if (!targetDate) continue;
    const exerciseIds = customRoutine[activity.plan].map((e) => e.id);
    const progress = getSessionProgress(exerciseSessions, targetDate, activity.plan, exerciseIds);
    if (isSessionComplete(progress)) strengthCompleted++;
  }
  const strengthProgrammed = STRENGTH_DAYS.length;
  const strengthCompliance = computeStrengthCompliance(strengthCompleted, strengthProgrammed);

  const cardioMinutes = logs.reduce((sum, log) => sum + (log.cardioMin ?? 0), 0);

  const daysWithData = dates.map((d) => dailyLogs[d]).filter((log) => dailyLogHasAnyData(log)).length;
  const daysWithAnyDataPct = daysWithData / 7;

  const overallCompliance = computeOverallCompliance(
    {
      pasos: pasosCompliance,
      sueno: suenoCompliance,
      calorias: caloriasCompliance,
      proteina: proteinaCompliance,
      fuerza: strengthCompliance,
    },
    daysWithAnyDataPct,
  );

  return {
    weekIndex,
    startDate: start,
    endDate: end,
    peso,
    cintura,
    pasos,
    sueno,
    calorias,
    proteina,
    pasosCompliance,
    suenoCompliance,
    caloriasCompliance,
    proteinaCompliance,
    strengthCompliance,
    strengthCompletedSessions: strengthCompleted,
    strengthProgrammedSessions: strengthProgrammed,
    cardioMinutes,
    overallCompliance,
    daysWithAnyDataPct,
    hasAnyDataThisWeek: daysWithData > 0,
  };
}

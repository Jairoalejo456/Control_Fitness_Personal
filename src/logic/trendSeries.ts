import type { DailyLogsMap, ISODateString } from '@/types/models';
import { computeMetricAverage } from './averages';
import { getDatesInRange, getWeekDateRange } from './dateUtils';

export interface TrendPoint {
  weekIndex: number;
  value: number;
}

function getWeeklySeries(
  dailyLogs: DailyLogsMap,
  fechaInicioPlan: ISODateString,
  duracionSemanas: number,
  field: 'pesoKg' | 'cinturaCm',
): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let week = 1; week <= duracionSemanas; week++) {
    const { start, end } = getWeekDateRange(week, fechaInicioPlan);
    const logs = getDatesInRange(start, end)
      .map((d) => dailyLogs[d])
      .filter((l): l is NonNullable<typeof l> => !!l);
    const { average } = computeMetricAverage(logs, field);
    // Semanas sin datos se omiten (no se interpola una línea recta sobre un hueco real).
    if (average !== null) {
      points.push({ weekIndex: week, value: average });
    }
  }
  return points;
}

export function getWeightTrendSeries(
  dailyLogs: DailyLogsMap,
  fechaInicioPlan: ISODateString,
  duracionSemanas: number,
): TrendPoint[] {
  return getWeeklySeries(dailyLogs, fechaInicioPlan, duracionSemanas, 'pesoKg');
}

export function getWaistTrendSeries(
  dailyLogs: DailyLogsMap,
  fechaInicioPlan: ISODateString,
  duracionSemanas: number,
): TrendPoint[] {
  return getWeeklySeries(dailyLogs, fechaInicioPlan, duracionSemanas, 'cinturaCm');
}

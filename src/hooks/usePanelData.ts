import { useMemo } from 'react';

import { useAppStore } from '@/store/appStore';
import { computeWeekMetrics, type WeekMetrics } from '@/logic/weekMetrics';
import { getWeekStatus } from '@/logic/weekStatus';
import { generateWeeklyRecommendation } from '@/logic/recommendations';
import { getWeekIndexForDate, todayISO, getDatesInRange } from '@/logic/dateUtils';
import { getWeightTrendSeries, getWaistTrendSeries } from '@/logic/trendSeries';
import type { WeekStatus } from '@/types/models';

export interface WeekHistoryRow {
  weekIndex: number;
  metrics: WeekMetrics;
  status: WeekStatus;
}

export function usePanelData() {
  const config = useAppStore((s) => s.config);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const customRoutine = useAppStore((s) => s.customRoutine);

  return useMemo(() => {
    const today = todayISO();
    const rawCurrentWeek = getWeekIndexForDate(today, config.fechaInicioPlan);
    const currentWeekIndex = Math.min(Math.max(1, rawCurrentWeek), config.duracionSemanas);

    const currentWeekMetrics = computeWeekMetrics(currentWeekIndex, config, dailyLogs, exerciseSessions, customRoutine);

    const recommendation = generateWeeklyRecommendation(
      currentWeekIndex,
      currentWeekMetrics.hasAnyDataThisWeek,
      currentWeekMetrics.daysWithAnyDataPct,
    );

    const weeksHistory: WeekHistoryRow[] = [];
    for (let week = 1; week <= config.duracionSemanas; week++) {
      const metrics = computeWeekMetrics(week, config, dailyLogs, exerciseSessions, customRoutine);
      const weekLogs = getDatesInRange(metrics.startDate, metrics.endDate).map((d) => dailyLogs[d]);
      const status = getWeekStatus({
        weekIndex: week,
        fechaInicioPlan: config.fechaInicioPlan,
        weekLogs,
        compliancePct: metrics.overallCompliance.kind === 'valor' ? metrics.overallCompliance.pct : null,
      });
      weeksHistory.push({ weekIndex: week, metrics, status });
    }

    const weightTrend = getWeightTrendSeries(dailyLogs, config.fechaInicioPlan, config.duracionSemanas);
    const waistTrend = getWaistTrendSeries(dailyLogs, config.fechaInicioPlan, config.duracionSemanas);

    return {
      currentWeekIndex,
      currentWeekMetrics,
      recommendation,
      weeksHistory,
      weightTrend,
      waistTrend,
    };
  }, [config, dailyLogs, exerciseSessions, customRoutine]);
}

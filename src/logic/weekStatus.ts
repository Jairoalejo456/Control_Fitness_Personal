import type { DailyLog, ISODateString, WeekStatus } from '@/types/models';
import { daysBetweenISO, getWeekIndexForDate, todayISO } from './dateUtils';

export function dailyLogHasAnyData(log: DailyLog | undefined): boolean {
  if (!log) return false;
  return (
    log.pesoKg !== null ||
    log.cinturaCm !== null ||
    log.pasos !== null ||
    log.suenoH !== null ||
    log.calorias !== null ||
    log.proteinaG !== null ||
    log.cardioMin !== null ||
    log.energia !== null ||
    log.dayLogged
  );
}

export interface WeekStatusInput {
  weekIndex: number;
  fechaInicioPlan: ISODateString;
  weekLogs: (DailyLog | undefined)[];
  compliancePct: number | null;
}

/**
 * 5 estados de semana en el histórico:
 * - "Aún no inicia": hoy es anterior a la fecha de inicio del plan.
 * - "Programada": semana futura (aún no llega).
 * - "En progreso": es la semana actual.
 * - "Datos insuficientes": semana ya terminada con menos de 4/7 días con algún dato.
 * - "{X}% cumplimiento": semana terminada con datos suficientes.
 */
export function getWeekStatus({ weekIndex, fechaInicioPlan, weekLogs, compliancePct }: WeekStatusInput): WeekStatus {
  const today = todayISO();

  if (daysBetweenISO(today, fechaInicioPlan) < 0) {
    return { label: 'aun-no-inicia', compliancePct: null };
  }

  const currentWeekIndex = getWeekIndexForDate(today, fechaInicioPlan);

  if (weekIndex > currentWeekIndex) {
    return { label: 'programada', compliancePct: null };
  }
  if (weekIndex === currentWeekIndex) {
    return { label: 'en-progreso', compliancePct: null };
  }

  const daysWithData = weekLogs.filter((log) => dailyLogHasAnyData(log)).length;
  if (daysWithData < 4) {
    return { label: 'datos-insuficientes', compliancePct: null };
  }
  if (compliancePct === null) {
    return { label: 'sin-datos', compliancePct: null };
  }
  return { label: 'cumplimiento', compliancePct };
}

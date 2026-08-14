import type { ISODateString, WeekDay } from '@/types/models';
import { WEEK_DAYS } from '@/types/models';

/** Construye una fecha local a mediodía para evitar corrimientos por zona horaria en comparaciones de solo-fecha. */
function toLocalNoonDate(iso: ISODateString): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function formatISODate(date: Date): ISODateString {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): ISODateString {
  return formatISODate(new Date());
}

export function addDaysISO(iso: ISODateString, days: number): ISODateString {
  const date = toLocalNoonDate(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

/** Diferencia en días calendario completos: `a - b`. */
export function daysBetweenISO(a: ISODateString, b: ISODateString): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = toLocalNoonDate(a).getTime() - toLocalNoonDate(b).getTime();
  return Math.round(diff / msPerDay);
}

export function isPastOrToday(iso: ISODateString): boolean {
  return daysBetweenISO(iso, todayISO()) <= 0;
}

export function isFutureDate(iso: ISODateString): boolean {
  return daysBetweenISO(iso, todayISO()) > 0;
}

/** Día de la semana calendario real de la fecha (independiente del día en que empezó el plan). */
export function getWeekDayName(iso: ISODateString): WeekDay {
  const jsDay = toLocalNoonDate(iso).getDay(); // 0=Dom..6=Sáb
  const index = (jsDay + 6) % 7; // 0=Lun..6=Dom
  return WEEK_DAYS[index];
}

/**
 * Índice de semana del plan (1-based) para una fecha dada, en bloques rodantes de 7 días
 * desde `fechaInicioPlan` — no semanas de calendario. Devuelve 0 si la fecha es anterior al inicio del plan.
 */
export function getWeekIndexForDate(iso: ISODateString, fechaInicioPlan: ISODateString): number {
  const diff = daysBetweenISO(iso, fechaInicioPlan);
  if (diff < 0) return 0;
  return Math.floor(diff / 7) + 1;
}

export function getWeekDateRange(weekIndex: number, fechaInicioPlan: ISODateString): { start: ISODateString; end: ISODateString } {
  const start = addDaysISO(fechaInicioPlan, (weekIndex - 1) * 7);
  const end = addDaysISO(start, 6);
  return { start, end };
}

export function getDatesInRange(start: ISODateString, end: ISODateString): ISODateString[] {
  const dates: ISODateString[] = [];
  let cursor = start;
  while (daysBetweenISO(cursor, end) <= 0) {
    dates.push(cursor);
    if (cursor === end) break;
    cursor = addDaysISO(cursor, 1);
  }
  return dates;
}

export function formatDisplayDate(iso: ISODateString): string {
  const date = toLocalNoonDate(iso);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

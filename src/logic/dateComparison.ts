import type { DailyLogsMap, ISODateString } from '@/types/models';
import { addDaysISO, daysBetweenISO, getDatesInRange } from './dateUtils';

export interface DateComparison {
  fechaA: ISODateString;
  fechaB: ISODateString;
  pesoA: number | null;
  pesoB: number | null;
  pesoDeltaKg: number | null;
  cinturaA: number | null;
  cinturaB: number | null;
  cinturaDeltaCm: number | null;
  cardioTotalMin: number;
  diasEnPeriodo: number;
}

const MAX_LOOKBACK_DAYS = 6;

/** Valor registrado en `fecha`, o el más cercano hacia atrás (hasta MAX_LOOKBACK_DAYS) si ese día no se registró. */
function nearestLoggedValue(dailyLogs: DailyLogsMap, fecha: ISODateString, field: 'pesoKg' | 'cinturaCm'): number | null {
  for (let offset = 0; offset <= MAX_LOOKBACK_DAYS; offset++) {
    const d = addDaysISO(fecha, -offset);
    const value = dailyLogs[d]?.[field];
    if (value !== null && value !== undefined) return value;
  }
  return null;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Compara peso/cintura entre dos fechas puntuales (con lookback si ese día exacto no tiene dato) y suma el cardio registrado en todo el período entre ambas. */
export function compareDates(dailyLogs: DailyLogsMap, fechaA: ISODateString, fechaB: ISODateString): DateComparison {
  const [start, end] = daysBetweenISO(fechaA, fechaB) <= 0 ? [fechaA, fechaB] : [fechaB, fechaA];

  const pesoA = nearestLoggedValue(dailyLogs, fechaA, 'pesoKg');
  const pesoB = nearestLoggedValue(dailyLogs, fechaB, 'pesoKg');
  const cinturaA = nearestLoggedValue(dailyLogs, fechaA, 'cinturaCm');
  const cinturaB = nearestLoggedValue(dailyLogs, fechaB, 'cinturaCm');

  const cardioTotalMin = getDatesInRange(start, end).reduce((sum, d) => sum + (dailyLogs[d]?.cardioMin ?? 0), 0);

  return {
    fechaA,
    fechaB,
    pesoA,
    pesoB,
    pesoDeltaKg: pesoA !== null && pesoB !== null ? round(pesoB - pesoA, 2) : null,
    cinturaA,
    cinturaB,
    cinturaDeltaCm: cinturaA !== null && cinturaB !== null ? round(cinturaB - cinturaA, 1) : null,
    cardioTotalMin,
    diasEnPeriodo: daysBetweenISO(end, start) + 1,
  };
}

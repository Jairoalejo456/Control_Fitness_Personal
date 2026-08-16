import { compareDates } from '../dateComparison';
import { EMPTY_DAILY_LOG, type DailyLogsMap } from '@/types/models';

describe('compareDates', () => {
  it('calcula el delta de peso y cintura entre dos fechas con datos exactos', () => {
    const logs: DailyLogsMap = {
      '2026-08-01': { ...EMPTY_DAILY_LOG, pesoKg: 82, cinturaCm: 90 },
      '2026-08-15': { ...EMPTY_DAILY_LOG, pesoKg: 79.5, cinturaCm: 87 },
    };
    const result = compareDates(logs, '2026-08-01', '2026-08-15');
    expect(result.pesoDeltaKg).toBe(-2.5);
    expect(result.cinturaDeltaCm).toBe(-3);
  });

  it('usa el registro más cercano hacia atrás si la fecha exacta no tiene dato', () => {
    const logs: DailyLogsMap = {
      '2026-08-13': { ...EMPTY_DAILY_LOG, pesoKg: 80 },
    };
    // se pide el 15, no hay dato ese día ni el 14 — debe encontrar el del 13
    const result = compareDates(logs, '2026-08-01', '2026-08-15');
    expect(result.pesoB).toBe(80);
  });

  it('devuelve null en el delta si falta un lado', () => {
    const logs: DailyLogsMap = {
      '2026-08-01': { ...EMPTY_DAILY_LOG, pesoKg: 82 },
    };
    const result = compareDates(logs, '2026-08-01', '2026-08-15');
    expect(result.pesoB).toBeNull();
    expect(result.pesoDeltaKg).toBeNull();
  });

  it('suma el cardio registrado en todo el período, sin importar el orden de los argumentos', () => {
    const logs: DailyLogsMap = {
      '2026-08-01': { ...EMPTY_DAILY_LOG, cardioMin: 20 },
      '2026-08-03': { ...EMPTY_DAILY_LOG, cardioMin: 30 },
      '2026-08-05': { ...EMPTY_DAILY_LOG, cardioMin: 10 },
    };
    const forward = compareDates(logs, '2026-08-01', '2026-08-05');
    const backward = compareDates(logs, '2026-08-05', '2026-08-01');
    expect(forward.cardioTotalMin).toBe(60);
    expect(backward.cardioTotalMin).toBe(60);
    expect(forward.diasEnPeriodo).toBe(5);
  });
});

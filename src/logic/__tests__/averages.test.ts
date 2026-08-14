import { computeMetricAverage } from '../averages';
import { EMPTY_DAILY_LOG, type DailyLog } from '@/types/models';

function log(partial: Partial<DailyLog>): DailyLog {
  return { ...EMPTY_DAILY_LOG, ...partial };
}

describe('computeMetricAverage', () => {
  it('devuelve "sin-datos" cuando no hay ningún registro', () => {
    const result = computeMetricAverage([], 'pesoKg');
    expect(result).toEqual({ average: null, count: 0, confidence: 'sin-datos' });
  });

  it('ignora los null en vez de tratarlos como cero', () => {
    const logs = [log({ pesoKg: 80 }), log({ pesoKg: null }), log({ pesoKg: null }), log({ pesoKg: 82 })];
    const result = computeMetricAverage(logs, 'pesoKg');
    // Si null contara como 0 el promedio sería (80+0+0+82)/4 = 40.5 — debe ser (80+82)/2 = 81
    expect(result.average).toBe(81);
    expect(result.count).toBe(2);
  });

  it('etiqueta "Promedio provisional" con 1-2 registros de peso', () => {
    const logs = [log({ pesoKg: 80 })];
    expect(computeMetricAverage(logs, 'pesoKg').confidence).toBe('provisional');
    const logs2 = [log({ pesoKg: 80 }), log({ pesoKg: 81 })];
    expect(computeMetricAverage(logs2, 'pesoKg').confidence).toBe('provisional');
  });

  it('etiqueta "Promedio semanal" con 3+ registros de peso', () => {
    const logs = [log({ pesoKg: 80 }), log({ pesoKg: 81 }), log({ pesoKg: 79 })];
    expect(computeMetricAverage(logs, 'pesoKg').confidence).toBe('semanal');
  });

  it('cintura usa umbral distinto: 1 registro -> provisional, 2+ -> semanal', () => {
    expect(computeMetricAverage([log({ cinturaCm: 88 })], 'cinturaCm').confidence).toBe('provisional');
    expect(
      computeMetricAverage([log({ cinturaCm: 88 }), log({ cinturaCm: 87 })], 'cinturaCm').confidence,
    ).toBe('semanal');
  });
});

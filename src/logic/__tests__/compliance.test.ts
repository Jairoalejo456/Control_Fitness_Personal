import { computeGoalCompliance, computeOverallCompliance, computeStrengthCompliance } from '../compliance';
import { EMPTY_DAILY_LOG, type DailyLog } from '@/types/models';

function log(partial: Partial<DailyLog>): DailyLog {
  return { ...EMPTY_DAILY_LOG, ...partial };
}

describe('computeGoalCompliance', () => {
  it('devuelve null si no hay ningún dato registrado', () => {
    expect(computeGoalCompliance([], 'pasos', (v) => v >= 5000)).toBeNull();
  });

  it('nunca divide por 7 si aún no hay 7 registros — divide por los días con dato', () => {
    // Solo 2 días registrados en la semana (no 7), ambos cumplen la meta -> 100%, no 2/7
    const logs = [log({ pasos: 5000 }), log({ pasos: 6000 })];
    expect(computeGoalCompliance(logs, 'pasos', (v) => v >= 5000)).toBe(1);
  });

  it('calcula el % correcto de días que cumplen la meta entre los días con dato', () => {
    const logs = [log({ pasos: 5000 }), log({ pasos: 3000 }), log({ pasos: null })];
    // 1 de 2 días con dato cumple la meta (el null se excluye del denominador)
    expect(computeGoalCompliance(logs, 'pasos', (v) => v >= 5000)).toBe(0.5);
  });
});

describe('computeStrengthCompliance', () => {
  it('devuelve null si no hay sesiones programadas', () => {
    expect(computeStrengthCompliance(0, 0)).toBeNull();
  });
  it('calcula sesiones completadas / programadas', () => {
    expect(computeStrengthCompliance(2, 4)).toBe(0.5);
  });
});

describe('computeOverallCompliance', () => {
  it('devuelve "datos-insuficientes" si el % de días con registro esa semana es <80%', () => {
    const result = computeOverallCompliance(
      { pasos: 1, sueno: 1, calorias: 1, proteina: 1, fuerza: 1 },
      0.5,
    );
    expect(result.kind).toBe('datos-insuficientes');
  });

  it('promedia solo los cumplimientos que sí tienen datos cuando el registro semanal es suficiente', () => {
    const result = computeOverallCompliance(
      { pasos: 1, sueno: null, calorias: 0.5, proteina: null, fuerza: null },
      0.9,
    );
    expect(result).toEqual({ kind: 'valor', pct: 0.75 });
  });

  it('devuelve "datos-insuficientes" si el registro es suficiente pero ninguna métrica tiene cumplimiento calculable', () => {
    const result = computeOverallCompliance(
      { pasos: null, sueno: null, calorias: null, proteina: null, fuerza: null },
      0.9,
    );
    expect(result.kind).toBe('datos-insuficientes');
  });
});

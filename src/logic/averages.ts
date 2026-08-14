import type { ConfidenceLevel, DailyLog, MetricAverage, MetricKey } from '@/types/models';

// El handoff especifica explícitamente los umbrales de peso (1-2 -> provisional, 3+ -> semanal)
// y cintura (1 -> provisional, 2+ -> semanal). Para pasos/sueño/calorías/proteína se asume el
// mismo patrón que peso (métrica diaria, umbral en 2) por ser la inferencia más razonable.
const PROVISIONAL_MAX: Record<MetricKey, number> = {
  pesoKg: 2,
  cinturaCm: 1,
  pasos: 2,
  suenoH: 2,
  calorias: 2,
  proteinaG: 2,
};

/**
 * Promedio null-safe de una métrica sobre una lista de registros diarios.
 * REGLA CRÍTICA: nunca usar `valor || 0` — los campos `null` (no registrados) se excluyen
 * del cálculo y del conteo, nunca cuentan como cero.
 */
export function computeMetricAverage(logs: DailyLog[], field: MetricKey): MetricAverage {
  const values = logs
    .map((log) => log[field])
    .filter((v): v is number => v !== null && v !== undefined);

  const count = values.length;
  if (count === 0) {
    return { average: null, count: 0, confidence: 'sin-datos' };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const average = sum / count;
  const confidence: ConfidenceLevel = count <= PROVISIONAL_MAX[field] ? 'provisional' : 'semanal';

  return { average, count, confidence };
}

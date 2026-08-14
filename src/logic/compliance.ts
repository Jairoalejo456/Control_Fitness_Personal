import type { DailyLog, MetricKey } from '@/types/models';

/**
 * Cumplimiento de una meta diaria = (días que alcanzaron la meta) / (días con ese dato
 * registrado esa semana) — nunca se divide por 7 si aún no hay 7 registros. Devuelve `null`
 * si no hay ningún dato registrado esa semana para esa métrica.
 */
export function computeGoalCompliance(
  logs: DailyLog[],
  field: MetricKey,
  meetsGoal: (value: number) => boolean,
): number | null {
  const values = logs
    .map((log) => log[field])
    .filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) return null;
  const met = values.filter(meetsGoal).length;
  return met / values.length;
}

/** Cumplimiento de fuerza = sesiones completadas al 100% / sesiones de fuerza programadas esa semana. */
export function computeStrengthCompliance(completedSessions: number, programmedSessions: number): number | null {
  if (programmedSessions === 0) return null;
  return completedSessions / programmedSessions;
}

export interface OverallComplianceInputs {
  pasos: number | null;
  sueno: number | null;
  calorias: number | null;
  proteina: number | null;
  fuerza: number | null;
}

export type OverallComplianceResult =
  | { kind: 'datos-insuficientes' }
  | { kind: 'valor'; pct: number };

/**
 * Cumplimiento general = promedio de los cumplimientos anteriores que sí tengan datos.
 * Si el % de días con algún registro esa semana es menor al 80%, se muestra "Datos insuficientes"
 * en vez de un porcentaje potencialmente engañoso.
 */
export function computeOverallCompliance(
  inputs: OverallComplianceInputs,
  daysWithAnyDataPct: number,
): OverallComplianceResult {
  if (daysWithAnyDataPct < 0.8) {
    return { kind: 'datos-insuficientes' };
  }
  const values = Object.values(inputs).filter((v): v is number => v !== null && v !== undefined);
  if (values.length === 0) {
    return { kind: 'datos-insuficientes' };
  }
  const pct = values.reduce((acc, v) => acc + v, 0) / values.length;
  return { kind: 'valor', pct };
}

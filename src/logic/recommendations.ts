/**
 * Recomendación semanal:
 * - "Necesitamos más datos" si no hay ningún registro esa semana.
 * - "Mejora la constancia" si el % de días con algún registro esa semana es <80%.
 * - En la primera semana nunca se recomiendan cambios de objetivos (calorías, etc.), solo continuidad.
 */
export function generateWeeklyRecommendation(
  weekIndex: number,
  hasAnyDataThisWeek: boolean,
  daysWithAnyDataPct: number,
): string {
  if (!hasAnyDataThisWeek) {
    return 'Necesitamos más datos: registra al menos un día para empezar a calcular tu progreso.';
  }
  if (daysWithAnyDataPct < 0.8) {
    return 'Mejora la constancia: registra más días esta semana para tener un panorama confiable.';
  }
  if (weekIndex <= 1) {
    return 'Vas bien encaminado. En la primera semana no ajustamos objetivos todavía — solo mantén la constancia.';
  }
  return 'Buen ritmo esta semana. Ajusta el peso o la banda cuando completes las series al máximo del rango con 1–2 RIR.';
}

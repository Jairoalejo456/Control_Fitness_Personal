// Meta de pasos por semana: 4000 (semana 1), 5000 (semana 2), 6000 (semana 3), 7000 (semana 4 en adelante).
export function getStepGoalForWeek(weekIndex: number): number {
  if (weekIndex <= 1) return 4000;
  if (weekIndex === 2) return 5000;
  if (weekIndex === 3) return 6000;
  return 7000;
}

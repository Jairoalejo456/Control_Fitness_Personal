import type { RoutineExercise } from '@/types/models';

/** Semanas 1-2: 2 series por ejercicio. Desde semana 3: el número de series indicado por ejercicio. */
export function getExpectedSetCount(exercise: RoutineExercise, weekIndex: number): number {
  return weekIndex <= 2 ? exercise.setsSemanas1_2 : exercise.setsSemana3Plus;
}

/** Semanas 1-2: 3 RIR objetivo. Desde semana 3: 1-2 RIR objetivo. */
export function getTargetRIRLabel(weekIndex: number): string {
  return weekIndex <= 2 ? '3 RIR' : '1–2 RIR';
}

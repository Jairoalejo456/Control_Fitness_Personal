import type { ExerciseDefaultsMap, StrengthPlanId } from '@/types/models';
import { exerciseDefaultsKey } from '@/types/models';

export interface SetPlaceholder {
  pesoKg: number | null;
  reps: number | null;
}

/** Placeholder de peso/reps que muestra la sesión anterior de ese mismo ejercicio (memoria). */
export function getPlaceholderForSet(
  defaults: ExerciseDefaultsMap,
  plan: StrengthPlanId,
  exerciseId: string,
  setIndex: number,
): SetPlaceholder {
  const key = exerciseDefaultsKey(plan, exerciseId);
  const d = defaults[key];
  if (!d) return { pesoKg: null, reps: null };
  return {
    pesoKg: d.pesoBySet[setIndex] ?? null,
    reps: d.repsBySet[setIndex] ?? null,
  };
}

/** Número de series por defecto para la próxima sesión (memoria de la sesión anterior), con fallback al valor de rutina. */
export function getDefaultSetCount(
  defaults: ExerciseDefaultsMap,
  plan: StrengthPlanId,
  exerciseId: string,
  fallback: number,
): number {
  const key = exerciseDefaultsKey(plan, exerciseId);
  return defaults[key]?.setCount ?? fallback;
}

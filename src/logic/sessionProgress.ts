import type { ExerciseSessionsMap, ISODateString, StrengthPlanId } from '@/types/models';
import { exerciseSessionKey } from '@/types/models';

export interface SessionProgress {
  done: number;
  total: number;
}

/** Progreso de la sesión de fuerza del día: series completadas / total de series registradas. */
export function getSessionProgress(
  sessions: ExerciseSessionsMap,
  fecha: ISODateString,
  plan: StrengthPlanId,
  exerciseIds: string[],
): SessionProgress {
  let done = 0;
  let total = 0;
  for (const id of exerciseIds) {
    const key = exerciseSessionKey(fecha, plan, id);
    const sets = sessions[key] ?? [];
    total += sets.length;
    done += sets.filter((s) => s.done).length;
  }
  return { done, total };
}

export function isSessionComplete(progress: SessionProgress): boolean {
  return progress.total > 0 && progress.done === progress.total;
}

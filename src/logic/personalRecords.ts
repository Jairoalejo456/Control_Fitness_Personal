import type { ExerciseSessionsMap, ISODateString, StrengthPlanId } from '@/types/models';

export interface PersonalRecord {
  pesoKg: number;
  reps: number;
  fecha: ISODateString;
}

/**
 * Mejor serie histórica de un ejercicio (mayor peso; a igual peso, más reps), sin
 * importar la semana. Solo cuentan series marcadas como `done` — una serie sin
 * terminar no es un récord real. `excludeFecha` permite comparar contra el récord
 * previo a una fecha puntual (ej. no contar la sesión que se está registrando ahora
 * mismo como si ya fuera el récord a batir).
 */
export function getPersonalRecord(
  exerciseSessions: ExerciseSessionsMap,
  plan: StrengthPlanId,
  exerciseId: string,
  excludeFecha?: ISODateString,
): PersonalRecord | null {
  const suffix = `__${plan}__${exerciseId}`;
  let best: PersonalRecord | null = null;

  for (const key of Object.keys(exerciseSessions)) {
    if (!key.endsWith(suffix)) continue;
    const fecha = key.slice(0, key.length - suffix.length);
    if (fecha === excludeFecha) continue;

    for (const set of exerciseSessions[key]) {
      if (!set.done || set.pesoKg === null || set.reps === null) continue;
      const beats = best === null || set.pesoKg > best.pesoKg || (set.pesoKg === best.pesoKg && set.reps > best.reps);
      if (beats) {
        best = { pesoKg: set.pesoKg, reps: set.reps, fecha };
      }
    }
  }

  return best;
}

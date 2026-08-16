import { getPersonalRecord } from '../personalRecords';
import type { ExerciseSessionsMap } from '@/types/models';

function set(pesoKg: number | null, reps: number | null, done = true) {
  return { pesoKg, reps, rir: null, done };
}

describe('getPersonalRecord', () => {
  it('devuelve null cuando no hay series completadas', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-10__superiorA__press-plano': [set(20, 8, false)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano')).toBeNull();
  });

  it('ignora series sin terminar (done: false)', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-10__superiorA__press-plano': [set(30, 10, false), set(20, 8, true)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano')).toEqual({
      pesoKg: 20,
      reps: 8,
      fecha: '2026-08-10',
    });
  });

  it('elige el mayor peso entre varias fechas', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-01__superiorA__press-plano': [set(20, 8)],
      '2026-08-08__superiorA__press-plano': [set(22.5, 6)],
      '2026-08-15__superiorA__press-plano': [set(21, 10)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano')).toEqual({
      pesoKg: 22.5,
      reps: 6,
      fecha: '2026-08-08',
    });
  });

  it('a igual peso, elige más repeticiones', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-01__superiorA__press-plano': [set(20, 8)],
      '2026-08-08__superiorA__press-plano': [set(20, 12)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano')?.reps).toBe(12);
  });

  it('no mezcla ejercicios ni planes distintos', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-01__superiorA__press-plano': [set(20, 8)],
      '2026-08-01__superiorA__remo': [set(50, 8)],
      '2026-08-01__inferiorA__press-plano': [set(99, 8)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano')?.pesoKg).toBe(20);
  });

  it('excludeFecha ignora esa sesión al calcular el récord', () => {
    const sessions: ExerciseSessionsMap = {
      '2026-08-01__superiorA__press-plano': [set(20, 8)],
      '2026-08-15__superiorA__press-plano': [set(30, 8)],
    };
    expect(getPersonalRecord(sessions, 'superiorA', 'press-plano', '2026-08-15')?.pesoKg).toBe(20);
  });
});

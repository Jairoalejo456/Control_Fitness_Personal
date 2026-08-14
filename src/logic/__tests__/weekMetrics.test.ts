import { computeWeekMetrics } from '../weekMetrics';
import { getDefaultConfig } from '@/data/defaultConfig';
import { ROUTINE_SEED } from '@/data/routineSeed';
import { EMPTY_DAILY_LOG, exerciseSessionKey, type DailyLogsMap, type ExerciseSessionsMap } from '@/types/models';
import { addDaysISO, getWeekDayName } from '../dateUtils';

describe('computeWeekMetrics', () => {
  it('encuentra la fecha correcta de cada día de fuerza aunque el plan no empiece un lunes', () => {
    const config = getDefaultConfig();
    // Forzamos un inicio de plan que caiga en miércoles, para que el bloque de 7 días
    // no empiece en lunes — así se detecta si el cálculo asume erróneamente dates[0]=lunes.
    let start = config.fechaInicioPlan;
    while (getWeekDayName(start) !== 'miercoles') {
      start = addDaysISO(start, 1);
    }
    config.fechaInicioPlan = start;

    // Encuentra la fecha real del "lunes" dentro de la semana 1 y completa esa sesión de Superior A.
    const lunesDate = Array.from({ length: 7 }, (_, i) => addDaysISO(start, i)).find((d) => getWeekDayName(d) === 'lunes')!;

    const exerciseSessions: ExerciseSessionsMap = {};
    for (const exercise of ROUTINE_SEED.superiorA) {
      const key = exerciseSessionKey(lunesDate, 'superiorA', exercise.id);
      exerciseSessions[key] = [{ pesoKg: 10, reps: 10, rir: 2, done: true }];
    }

    const dailyLogs: DailyLogsMap = { [lunesDate]: { ...EMPTY_DAILY_LOG, dayLogged: true } };

    const metrics = computeWeekMetrics(1, config, dailyLogs, exerciseSessions, ROUTINE_SEED);
    expect(metrics.strengthCompletedSessions).toBe(1);
  });

  it('la suma de minutos de cardio semanal ignora los días sin registrar (no cuenta como 0 erróneo, simplemente no suma)', () => {
    const config = getDefaultConfig();
    const dailyLogs: DailyLogsMap = {
      [config.fechaInicioPlan]: { ...EMPTY_DAILY_LOG, cardioMin: 30 },
      [addDaysISO(config.fechaInicioPlan, 1)]: { ...EMPTY_DAILY_LOG, cardioMin: null },
    };
    const metrics = computeWeekMetrics(1, config, dailyLogs, {}, ROUTINE_SEED);
    expect(metrics.cardioMinutes).toBe(30);
  });
});

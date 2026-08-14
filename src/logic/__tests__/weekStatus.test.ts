import { getWeekStatus } from '../weekStatus';
import { addDaysISO, todayISO } from '../dateUtils';
import { EMPTY_DAILY_LOG, type DailyLog } from '@/types/models';

function log(partial: Partial<DailyLog>): DailyLog {
  return { ...EMPTY_DAILY_LOG, ...partial };
}

describe('getWeekStatus', () => {
  it('"Aún no inicia" cuando hoy es anterior a la fecha de inicio del plan', () => {
    const fechaInicioPlan = addDaysISO(todayISO(), 10);
    const status = getWeekStatus({ weekIndex: 1, fechaInicioPlan, weekLogs: [], compliancePct: null });
    expect(status.label).toBe('aun-no-inicia');
  });

  it('"Programada" para una semana futura', () => {
    const fechaInicioPlan = addDaysISO(todayISO(), -3); // el plan ya empezó, estamos en semana 1
    const status = getWeekStatus({ weekIndex: 3, fechaInicioPlan, weekLogs: [], compliancePct: null });
    expect(status.label).toBe('programada');
  });

  it('"En progreso" para la semana actual', () => {
    const fechaInicioPlan = addDaysISO(todayISO(), -3);
    const status = getWeekStatus({ weekIndex: 1, fechaInicioPlan, weekLogs: [], compliancePct: null });
    expect(status.label).toBe('en-progreso');
  });

  it('"Datos insuficientes" para una semana terminada con menos de 4/7 días con datos', () => {
    const fechaInicioPlan = addDaysISO(todayISO(), -10); // semana 1 ya terminó (día 8+)
    const weekLogs = [log({ pesoKg: 80 }), log({ pesoKg: 81 }), undefined, undefined, undefined, undefined, undefined];
    const status = getWeekStatus({ weekIndex: 1, fechaInicioPlan, weekLogs, compliancePct: 0.9 });
    expect(status.label).toBe('datos-insuficientes');
  });

  it('"{X}% cumplimiento" para una semana terminada con datos suficientes', () => {
    const fechaInicioPlan = addDaysISO(todayISO(), -10);
    const weekLogs = [
      log({ pesoKg: 80 }),
      log({ pesoKg: 81 }),
      log({ pesoKg: 80 }),
      log({ pesoKg: 80 }),
      undefined,
      undefined,
      undefined,
    ];
    const status = getWeekStatus({ weekIndex: 1, fechaInicioPlan, weekLogs, compliancePct: 0.85 });
    expect(status).toEqual({ label: 'cumplimiento', compliancePct: 0.85 });
  });
});

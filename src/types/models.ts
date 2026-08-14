export type ISODateString = string; // 'YYYY-MM-DD'
export type Sex = 'hombre' | 'mujer';

export interface UserConfig {
  edad: number;
  sexo: Sex;
  estaturaM: number;
  pesoInicialKg: number;
  cinturaInicialCm: number;
  fechaInicioPlan: ISODateString;
  duracionSemanas: number;
  caloriasObjetivo: number;
  caloriasTolerancia: number;
  proteinaMinG: number;
  proteinaIdealG: number;
  suenoMinH: number;
  suenoIdealH: number;
}

export interface DailyLog {
  pesoKg: number | null;
  cinturaCm: number | null;
  pasos: number | null;
  suenoH: number | null;
  calorias: number | null;
  proteinaG: number | null;
  cardioMin: number | null;
  energia: number | null; // 1-10
  notas: string | null;
  dayLogged: boolean;
}

export const EMPTY_DAILY_LOG: DailyLog = {
  pesoKg: null,
  cinturaCm: null,
  pasos: null,
  suenoH: null,
  calorias: null,
  proteinaG: null,
  cardioMin: null,
  energia: null,
  notas: null,
  dayLogged: false,
};

export type DailyLogsMap = Record<ISODateString, DailyLog>;

export type StrengthPlanId = 'superiorA' | 'inferiorA' | 'superiorB' | 'inferiorB';
export type CardioPlanId = 'miercoles' | 'sabado';
export type WeekDay = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export const WEEK_DAYS: WeekDay[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miercoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
  domingo: 'Dom',
};

export const WEEK_DAY_FULL_LABELS: Record<WeekDay, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

// Qué ocurre cada día de la semana
export type DayActivity =
  | { type: 'fuerza'; plan: StrengthPlanId; planName: string }
  | { type: 'cardio'; plan: CardioPlanId; planName: string; obligatorio: boolean }
  | { type: 'descanso' };

export const DAY_SCHEDULE: Record<WeekDay, DayActivity> = {
  lunes: { type: 'fuerza', plan: 'superiorA', planName: 'Superior A' },
  martes: { type: 'fuerza', plan: 'inferiorA', planName: 'Inferior A' },
  miercoles: { type: 'cardio', plan: 'miercoles', planName: 'Cardio', obligatorio: true },
  jueves: { type: 'fuerza', plan: 'superiorB', planName: 'Superior B' },
  viernes: { type: 'fuerza', plan: 'inferiorB', planName: 'Inferior B' },
  sabado: { type: 'cardio', plan: 'sabado', planName: 'Cardio opcional', obligatorio: false },
  domingo: { type: 'descanso' },
};

export interface ExerciseSetEntry {
  pesoKg: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

// key = `${fecha}__${plan}__${ejercicioId}`
export type ExerciseSessionsMap = Record<string, ExerciseSetEntry[]>;

export function exerciseSessionKey(fecha: ISODateString, plan: StrengthPlanId, ejercicioId: string): string {
  return `${fecha}__${plan}__${ejercicioId}`;
}

export interface ExerciseDefaults {
  pesoBySet: (number | null)[];
  repsBySet: (number | null)[];
  setCount: number;
}

// key = `${plan}__${ejercicioId}`
export type ExerciseDefaultsMap = Record<string, ExerciseDefaults>;

export function exerciseDefaultsKey(plan: StrengthPlanId, ejercicioId: string): string {
  return `${plan}__${ejercicioId}`;
}

export type RepUnit = 'reps' | 'reps_lado' | 'reps_pierna' | 'seg';

export const REP_UNIT_LABELS: Record<RepUnit, string> = {
  reps: 'reps',
  reps_lado: 'reps/lado',
  reps_pierna: 'reps/pierna',
  seg: 'seg',
};

export interface RoutineExercise {
  id: string;
  nombre: string;
  variante: string | null;
  repMin: number;
  repMax: number;
  unidad: RepUnit;
  setsSemanas1_2: number;
  setsSemana3Plus: number;
  descanso: string;
  notaTecnica: string;
}

export type CustomRoutineMap = Record<StrengthPlanId, RoutineExercise[]>;
export type CustomCardioDescMap = Record<CardioPlanId, string>;

export interface AppState {
  schemaVersion: number;
  onboardingDone: boolean;
  config: UserConfig;
  dailyLogs: DailyLogsMap;
  exerciseSessions: ExerciseSessionsMap;
  exerciseDefaults: ExerciseDefaultsMap;
  customRoutine: CustomRoutineMap;
  customCardioDesc: CustomCardioDescMap;
}

export type MetricKey =
  | 'pesoKg'
  | 'cinturaCm'
  | 'pasos'
  | 'suenoH'
  | 'calorias'
  | 'proteinaG';

export type ConfidenceLevel = 'sin-datos' | 'provisional' | 'semanal';

export interface MetricAverage {
  average: number | null;
  count: number;
  confidence: ConfidenceLevel;
}

export type WeekStatusLabel =
  | 'aun-no-inicia'
  | 'programada'
  | 'en-progreso'
  | 'datos-insuficientes'
  | 'sin-datos'
  | 'cumplimiento';

export interface WeekStatus {
  label: WeekStatusLabel;
  compliancePct: number | null; // solo presente si label === 'cumplimiento'
}

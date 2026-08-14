import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AppState,
  CardioPlanId,
  DailyLog,
  ExerciseSetEntry,
  ISODateString,
  RoutineExercise,
  StrengthPlanId,
  UserConfig,
} from '@/types/models';
import { EMPTY_DAILY_LOG, exerciseDefaultsKey, exerciseSessionKey } from '@/types/models';
import { CARDIO_DESC_SEED, ROUTINE_SEED } from '@/data/routineSeed';
import { getDefaultConfig } from '@/data/defaultConfig';

const STORAGE_KEY = 'cf-personal-state-v1';
const SCHEMA_VERSION = 1;

interface AppStoreState extends AppState {
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  setConfig: (partial: Partial<UserConfig>) => void;
  completeOnboarding: (config: UserConfig) => void;

  upsertDailyLog: (fecha: ISODateString, partial: Partial<DailyLog>) => void;

  setExerciseSet: (
    fecha: ISODateString,
    plan: StrengthPlanId,
    exerciseId: string,
    setIndex: number,
    partial: Partial<ExerciseSetEntry>,
  ) => void;
  addSet: (fecha: ISODateString, plan: StrengthPlanId, exerciseId: string) => void;
  removeSet: (fecha: ISODateString, plan: StrengthPlanId, exerciseId: string, setIndex: number) => void;
  toggleSetDone: (fecha: ISODateString, plan: StrengthPlanId, exerciseId: string, setIndex: number) => void;

  reorderExercises: (plan: StrengthPlanId, orderedIds: string[]) => void;
  updateExercise: (plan: StrengthPlanId, exerciseId: string, partial: Partial<RoutineExercise>) => void;
  updateCardioDesc: (plan: CardioPlanId, texto: string) => void;

  exportState: () => string;
  importState: (json: string) => { ok: boolean; error?: string };
}

function getInitialAppState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    onboardingDone: false,
    config: getDefaultConfig(),
    dailyLogs: {},
    exerciseSessions: {},
    exerciseDefaults: {},
    customRoutine: ROUTINE_SEED,
    customCardioDesc: CARDIO_DESC_SEED,
  };
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialAppState(),
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setConfig: (partial) => set((state) => ({ config: { ...state.config, ...partial } })),

      completeOnboarding: (config) => set({ config, onboardingDone: true }),

      upsertDailyLog: (fecha, partial) =>
        set((state) => ({
          dailyLogs: {
            ...state.dailyLogs,
            [fecha]: { ...EMPTY_DAILY_LOG, ...state.dailyLogs[fecha], ...partial },
          },
        })),

      setExerciseSet: (fecha, plan, exerciseId, setIndex, partial) =>
        set((state) => {
          const key = exerciseSessionKey(fecha, plan, exerciseId);
          const sets = [...(state.exerciseSessions[key] ?? [])];
          const current = sets[setIndex] ?? { pesoKg: null, reps: null, rir: null, done: false };
          sets[setIndex] = { ...current, ...partial };
          return { exerciseSessions: { ...state.exerciseSessions, [key]: sets } };
        }),

      addSet: (fecha, plan, exerciseId) =>
        set((state) => {
          const key = exerciseSessionKey(fecha, plan, exerciseId);
          const sets = [...(state.exerciseSessions[key] ?? [])];
          sets.push({ pesoKg: null, reps: null, rir: null, done: false });
          return { exerciseSessions: { ...state.exerciseSessions, [key]: sets } };
        }),

      removeSet: (fecha, plan, exerciseId, setIndex) =>
        set((state) => {
          const key = exerciseSessionKey(fecha, plan, exerciseId);
          const sets = (state.exerciseSessions[key] ?? []).filter((_, i) => i !== setIndex);
          return { exerciseSessions: { ...state.exerciseSessions, [key]: sets } };
        }),

      toggleSetDone: (fecha, plan, exerciseId, setIndex) =>
        set((state) => {
          const key = exerciseSessionKey(fecha, plan, exerciseId);
          const sets = [...(state.exerciseSessions[key] ?? [])];
          const current = sets[setIndex];
          if (!current) return {};
          sets[setIndex] = { ...current, done: !current.done };

          // Actualiza la memoria (placeholders) de la próxima sesión con los valores de esta serie.
          const defaultsKey = exerciseDefaultsKey(plan, exerciseId);
          const prevDefaults = state.exerciseDefaults[defaultsKey] ?? {
            pesoBySet: [],
            repsBySet: [],
            setCount: sets.length,
          };
          const pesoBySet = [...prevDefaults.pesoBySet];
          const repsBySet = [...prevDefaults.repsBySet];
          pesoBySet[setIndex] = sets[setIndex].pesoKg;
          repsBySet[setIndex] = sets[setIndex].reps;

          return {
            exerciseSessions: { ...state.exerciseSessions, [key]: sets },
            exerciseDefaults: {
              ...state.exerciseDefaults,
              [defaultsKey]: { pesoBySet, repsBySet, setCount: sets.length },
            },
          };
        }),

      reorderExercises: (plan, orderedIds) =>
        set((state) => {
          const exercises = state.customRoutine[plan];
          const byId = new Map(exercises.map((e) => [e.id, e]));
          const reordered = orderedIds.map((id) => byId.get(id)).filter((e): e is RoutineExercise => !!e);
          return { customRoutine: { ...state.customRoutine, [plan]: reordered } };
        }),

      updateExercise: (plan, exerciseId, partial) =>
        set((state) => ({
          customRoutine: {
            ...state.customRoutine,
            [plan]: state.customRoutine[plan].map((e) => (e.id === exerciseId ? { ...e, ...partial } : e)),
          },
        })),

      updateCardioDesc: (plan, texto) =>
        set((state) => ({ customCardioDesc: { ...state.customCardioDesc, [plan]: texto } })),

      exportState: () => {
        const state = get();
        const appState: AppState = {
          schemaVersion: state.schemaVersion,
          onboardingDone: state.onboardingDone,
          config: state.config,
          dailyLogs: state.dailyLogs,
          exerciseSessions: state.exerciseSessions,
          exerciseDefaults: state.exerciseDefaults,
          customRoutine: state.customRoutine,
          customCardioDesc: state.customCardioDesc,
        };
        return JSON.stringify({ schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), appState }, null, 2);
      },

      importState: (json) => {
        try {
          const parsed = JSON.parse(json);
          const appState: AppState | undefined = parsed?.appState ?? parsed;
          if (!appState || typeof appState !== 'object' || !appState.config || !appState.dailyLogs) {
            return { ok: false, error: 'El archivo no tiene el formato esperado.' };
          }
          set({ ...appState, schemaVersion: SCHEMA_VERSION });
          return { ok: true };
        } catch {
          return { ok: false, error: 'No se pudo leer el archivo. Verifica que sea un respaldo válido.' };
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: SCHEMA_VERSION,
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        onboardingDone: state.onboardingDone,
        config: state.config,
        dailyLogs: state.dailyLogs,
        exerciseSessions: state.exerciseSessions,
        exerciseDefaults: state.exerciseDefaults,
        customRoutine: state.customRoutine,
        customCardioDesc: state.customCardioDesc,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

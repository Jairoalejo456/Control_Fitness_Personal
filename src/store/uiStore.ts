import { create } from 'zustand';

import type { ISODateString, WeekDay } from '@/types/models';
import { todayISO } from '@/logic/dateUtils';

interface UiStoreState {
  hoySelectedDate: ISODateString;
  setHoySelectedDate: (date: ISODateString) => void;
  resetHoySelectedDateToToday: () => void;

  rutinaSelectedDay: WeekDay;
  setRutinaSelectedDay: (day: WeekDay) => void;

  adminSelectedDay: WeekDay;
  setAdminSelectedDay: (day: WeekDay) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  hoySelectedDate: todayISO(),
  setHoySelectedDate: (date) => set({ hoySelectedDate: date }),
  resetHoySelectedDateToToday: () => set({ hoySelectedDate: todayISO() }),

  rutinaSelectedDay: 'lunes',
  setRutinaSelectedDay: (day) => set({ rutinaSelectedDay: day }),

  adminSelectedDay: 'lunes',
  setAdminSelectedDay: (day) => set({ adminSelectedDay: day }),
}));

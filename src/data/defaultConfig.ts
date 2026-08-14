import type { UserConfig } from '@/types/models';
import { formatISODate } from '@/logic/dateUtils';

// Valores sugeridos para prellenar el onboarding (el usuario los confirma o cambia).
export function getDefaultConfig(): UserConfig {
  return {
    edad: 21,
    sexo: 'hombre',
    estaturaM: 1.78,
    pesoInicialKg: 80,
    cinturaInicialCm: 88,
    fechaInicioPlan: formatISODate(new Date()),
    duracionSemanas: 16,
    caloriasObjetivo: 2450,
    caloriasTolerancia: 150,
    proteinaMinG: 150,
    proteinaIdealG: 160,
    suenoMinH: 7,
    suenoIdealH: 8,
  };
}

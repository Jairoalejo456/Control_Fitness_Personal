// Datos oficiales de la rutina de 16 semanas, transcritos 1:1 de
// design_handoff_fitness_tracker/data-reference.md (hoja "Rutina").
// Regla global: semanas 1-2 -> 2 series y 3 RIR objetivo por ejercicio.
// Desde semana 3 -> el número de series indicado abajo ("setsSemana3Plus") y 1-2 RIR objetivo.

import type { CustomCardioDescMap, CustomRoutineMap, RoutineExercise } from '@/types/models';

function ex(
  id: string,
  nombre: string,
  setsSemana3Plus: number,
  repMin: number,
  repMax: number,
  unidad: RoutineExercise['unidad'],
  descanso: string,
  notaTecnica: string,
): RoutineExercise {
  return {
    id,
    nombre,
    variante: null,
    repMin,
    repMax,
    unidad,
    setsSemanas1_2: 2,
    setsSemana3Plus,
    descanso,
    notaTecnica,
  };
}

export const ROUTINE_SEED: CustomRoutineMap = {
  superiorA: [
    ex('superiorA-1', 'Press plano con mancuernas', 3, 6, 10, 'reps', '2–3 min', 'Registra el peso de cada mancuerna.'),
    ex('superiorA-2', 'Dominada neutra asistida', 3, 5, 8, 'reps', '2–3 min', 'Registra la power band: 25 kg → 15 kg → sin banda.'),
    ex('superiorA-3', 'Remo con mancuerna a una mano', 3, 8, 12, 'reps_lado', '2 min', 'Registra las repeticiones del lado más débil.'),
    ex('superiorA-4', 'Press de hombros con mancuernas', 2, 8, 12, 'reps', '2 min', 'Sin arquear exageradamente la espalda.'),
    ex('superiorA-5', 'Elevación lateral con mancuernas', 3, 12, 20, 'reps', '60–90 s', 'Controla la bajada; no balancees el torso.'),
    ex('superiorA-6', 'Curl de bíceps con mancuernas', 2, 10, 15, 'reps', '60–90 s', 'Codos estables.'),
    ex('superiorA-7', 'Extensión de tríceps con banda', 2, 10, 15, 'reps', '60–90 s', 'Anclaje alto; registra color y combinación.'),
  ],
  inferiorA: [
    ex('inferiorA-1', 'Sentadilla búlgara con mancuernas', 3, 8, 12, 'reps_pierna', '2–3 min', 'Registra el lado más débil; banco firme.'),
    ex('inferiorA-2', 'Peso muerto rumano con barra', 3, 8, 12, 'reps', '2–3 min', 'Cadera atrás y espalda neutra.'),
    ex('inferiorA-3', 'Sentadilla goblet con talones elevados', 2, 10, 15, 'reps', '2 min', 'Recorrido controlado y rodillas alineadas.'),
    ex('inferiorA-4', 'Hip thrust con barra', 3, 8, 12, 'reps', '2 min', 'Pausa breve arriba; usa almohadilla.'),
    ex('inferiorA-5', 'Elevación de pantorrillas con peso', 3, 12, 20, 'reps', '60–90 s', 'Estira abajo y pausa arriba.'),
    ex('inferiorA-6', 'Plancha abdominal', 2, 30, 60, 'seg', '60 s', 'Cuerpo recto; detén si pierdes posición.'),
  ],
  superiorB: [
    ex('superiorB-1', 'Dominada supina asistida', 3, 5, 8, 'reps', '2–3 min', 'Registra la power band usada.'),
    ex('superiorB-2', 'Flexión con manos sobre banco', 3, 8, 12, 'reps', '2 min', 'Cuando logres 3×12 a 2 RIR, pasa al piso.'),
    ex('superiorB-3', 'Remo con banda tubular', 3, 10, 15, 'reps', '2 min', 'Registra color/combinación y distancia al anclaje.'),
    ex('superiorB-4', 'Apertura de pecho con banda', 2, 12, 20, 'reps', '60–90 s', 'Anclaje estable; movimiento controlado.'),
    ex('superiorB-5', 'Elevación lateral', 2, 12, 20, 'reps', '60–90 s', 'Puede hacerse con mancuerna o banda.'),
    ex('superiorB-6', 'Face pull con banda', 3, 12, 20, 'reps', '60–90 s', 'Hala hacia la cara separando las manos.'),
    ex('superiorB-7', 'Curl martillo con mancuernas', 2, 10, 15, 'reps', '60–90 s', 'Agarre neutro y torso quieto.'),
    ex('superiorB-8', 'Extensión de tríceps sobre la cabeza', 2, 10, 15, 'reps', '60–90 s', 'Usa mancuerna o banda y registra variante.'),
  ],
  inferiorB: [
    ex('inferiorB-1', 'Sentadilla goblet con talones elevados', 3, 10, 15, 'reps', '2–3 min', 'Recorrido controlado.'),
    ex('inferiorB-2', 'Zancada hacia atrás con mancuernas', 3, 8, 12, 'reps_pierna', '2 min', 'Registra el lado más débil.'),
    ex('inferiorB-3', 'Hip thrust con barra', 3, 10, 15, 'reps', '2 min', 'Pausa breve arriba.'),
    ex('inferiorB-4', 'Curl femoral con banda y tobilleras', 3, 12, 20, 'reps', '60–90 s', 'Registra color/combinación y posición del anclaje.'),
    ex('inferiorB-5', 'Elevación de pantorrillas con peso', 3, 12, 20, 'reps', '60–90 s', 'Estira abajo y pausa arriba.'),
    ex('inferiorB-6', 'Abdominal invertido', 2, 10, 20, 'reps', '60 s', 'Mueve la pelvis; evita usar impulso.'),
  ],
};

export const CARDIO_DESC_SEED: CustomCardioDescMap = {
  miercoles: 'Caminadora 30–40 min · intensidad 4–5/10 · debes poder hablar en frases.',
  sabado: '25–35 min suaves opcionales; si hay mucha fatiga, caminata relajada.',
};

export const WARMUP_NOTE = 'Caminadora 5 minutos sin fatiga.';

export const PROGRESSION_NOTES = {
  general:
    'Semanas 1–2: 2 series por ejercicio y 3 RIR. Desde semana 3: series indicadas y 1–2 RIR. Cuando completes todas las series en el máximo del rango con 1–2 RIR, aumenta peso, usa una banda más fuerte o reduce la asistencia.',
  dominadas: 'Dominadas: power band 25 kg → 15 kg → sin banda.',
  flexiones: 'Flexiones: manos en banco → piso → pies elevados o banda.',
};

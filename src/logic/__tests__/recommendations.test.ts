import { generateWeeklyRecommendation } from '../recommendations';

describe('generateWeeklyRecommendation', () => {
  it('pide más datos si no hay ningún registro esa semana', () => {
    expect(generateWeeklyRecommendation(1, false, 0)).toMatch(/Necesitamos más datos/);
  });

  it('pide mejorar la constancia si el registro semanal es menor al 80%', () => {
    expect(generateWeeklyRecommendation(2, true, 0.5)).toMatch(/Mejora la constancia/);
  });

  it('nunca sugiere cambios de objetivos en la primera semana', () => {
    const text = generateWeeklyRecommendation(1, true, 1);
    expect(text).not.toMatch(/calorías|peso|banda/i);
  });

  it('desde la semana 2 en adelante sí puede sugerir progresión de carga', () => {
    const text = generateWeeklyRecommendation(3, true, 1);
    expect(text).toMatch(/peso|banda/i);
  });
});

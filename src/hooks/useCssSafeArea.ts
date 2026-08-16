import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_BOTTOM_INSET = 40;
// Alto real del home indicator en todo iPhone con Face ID (34pt, estable en
// portrait). Tope específico para web: más ajustado que MAX_BOTTOM_INSET (nativo)
// porque acá el problema observado es justo una lectura de --safe-bottom inflada.
const MAX_BOTTOM_INSET_WEB = 34;

/**
 * En web, lee la zona segura directo de env() por CSS puro (variables --safe-top/
 * --safe-bottom definidas en +html.tsx) en vez de la medición JS de
 * react-native-safe-area-context (técnica de div oculto + getComputedStyle) — en
 * las pruebas de este proyecto esa medición JS dio valores distintos entre cargas
 * en el mismo dispositivo, mientras que env() por CSS se mantuvo estable. En
 * nativo (iOS/Android) no hay este problema, se usa el inset real de la
 * plataforma tal cual.
 */
export function useCssSafeArea() {
  const insets = useSafeAreaInsets();
  const [css, setCss] = useState<{ top: number; bottom: number } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const top = parseFloat(style.getPropertyValue('--safe-top')) || 0;
      const bottom = parseFloat(style.getPropertyValue('--safe-bottom')) || 0;
      setCss({ top, bottom });
    };

    read();
    const timers = [50, 200, 500].map((ms) => setTimeout(read, ms));
    window.addEventListener('resize', read);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', read);
    };
  }, []);

  if (Platform.OS === 'web') {
    // Mismo tope que en nativo (línea de abajo): una lectura de --safe-bottom
    // inflada por el navegador no debe agrandar el espacio reservado más allá
    // del home indicator real.
    return { top: css?.top ?? 0, bottom: Math.min(css?.bottom ?? 0, MAX_BOTTOM_INSET_WEB) };
  }
  return { top: insets.top, bottom: Math.min(insets.bottom, MAX_BOTTOM_INSET) };
}

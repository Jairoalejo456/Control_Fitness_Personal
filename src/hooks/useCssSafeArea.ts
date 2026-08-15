import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_BOTTOM_INSET = 40;

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
    return { top: css?.top ?? 0, bottom: css?.bottom ?? 0 };
  }
  return { top: insets.top, bottom: Math.min(insets.bottom, MAX_BOTTOM_INSET) };
}

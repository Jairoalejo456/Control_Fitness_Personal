import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_BOTTOM_INSET = 40;

/**
 * En web, lee la zona segura inferior directo de env() por CSS puro (variable
 * --safe-bottom definida en +html.tsx) en vez de la medición JS de
 * react-native-safe-area-context (técnica de div oculto) — en las pruebas de este
 * proyecto el valor por CSS se mantuvo estable (34px) mientras que otras
 * mediciones JS del mismo dispositivo variaron entre cargas. En nativo (iOS/
 * Android) no hay este problema, se usa el inset real de la plataforma tal cual.
 */
export function useCssSafeBottom() {
  const insets = useSafeAreaInsets();
  const [cssBottom, setCssBottom] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const read = () => {
      const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0;
      setCssBottom(value);
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
    return cssBottom ?? 0;
  }
  return Math.min(insets.bottom, MAX_BOTTOM_INSET);
}

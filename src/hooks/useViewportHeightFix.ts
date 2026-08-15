import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only. `100dvh` no se soporta bien en todas las versiones de Safari iOS (o se
 * calcula mal en algunas). `window.innerHeight` es la altura real del viewport
 * visible, soportada desde siempre en cualquier navegador — la escribimos como
 * variable CSS y `+html.tsx` la usa como la fuente de verdad para la altura de
 * html/body/#root, con 100dvh y 100% como respaldo mientras el JS no ha corrido.
 */
export function useViewportHeightFix() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const setHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);

    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
    };
  }, []);
}

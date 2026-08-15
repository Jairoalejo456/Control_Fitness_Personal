import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only. Mantiene --app-height sincronizada con lo que JS mide del viewport.
 *
 * IMPORTANTE: esta variable ya NO controla el tamaño de #root (ver +html.tsx —
 * ahora usa position:fixed con los 4 bordes en 0, que el navegador ajusta él
 * mismo sin depender de ninguna medición JS). Se comprobó con datos reales de
 * dispositivo que `visualViewport.height`/`window.innerHeight` pueden dar
 * valores *distintos* entre aperturas separadas de la misma app standalone en
 * el mismo iPhone (812px una vez, 874px —el alto real— otra) sin que se trate
 * de una medición temprana sin asentar — a veces simplemente no llegan al
 * valor correcto. Este hook se dejó corriendo solo para que el panel de
 * Diagnóstico en Configuración pueda seguir mostrando y comparando ese valor.
 */
export function useViewportHeightFix() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const viewport = window.visualViewport;

    const setHeight = () => {
      const height = viewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${height}px`);
    };

    setHeight();
    const settleTimers = [50, 200, 500, 1000].map((ms) => setTimeout(setHeight, ms));

    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    viewport?.addEventListener('resize', setHeight);
    viewport?.addEventListener('scroll', setHeight);

    return () => {
      settleTimers.forEach(clearTimeout);
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
      viewport?.removeEventListener('resize', setHeight);
      viewport?.removeEventListener('scroll', setHeight);
    };
  }, []);
}

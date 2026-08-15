import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only. Mantiene --app-height sincronizada con el alto real visible de la
 * página, sin importar qué chrome del navegador (barra de Safari, barra inferior,
 * teclado) esté ocupando espacio en ese momento.
 *
 * `window.visualViewport` es la API que Apple documenta específicamente para esto
 * (soportada desde iOS 13): a diferencia de `window.innerHeight`, que en Safari
 * puede no reflejar de inmediato el espacio real disponible cuando la barra de
 * herramientas de Safari aparece/desaparece, `visualViewport.height` sí se ajusta
 * en tiempo real y dispara sus propios eventos `resize`/`scroll`. Se usa como
 * fuente principal, con `window.innerHeight` como respaldo en navegadores que no
 * la soportan.
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
    window.addEventListener('resize', setHeight);
    window.addEventListener('orientationchange', setHeight);
    viewport?.addEventListener('resize', setHeight);
    viewport?.addEventListener('scroll', setHeight);

    return () => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('orientationchange', setHeight);
      viewport?.removeEventListener('resize', setHeight);
      viewport?.removeEventListener('scroll', setHeight);
    };
  }, []);
}

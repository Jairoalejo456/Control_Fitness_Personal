import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only. Mantiene --app-height sincronizada con el alto real de pantalla.
 *
 * Confirmado con datos reales de dispositivo (panel de Diagnóstico en
 * Configuración, iPhone 16 Pro en modo standalone): `visualViewport.height` /
 * `window.innerHeight` reportan 812px, pero la pantalla real mide 874pt
 * (402×874 según Apple) — la diferencia, 62px, coincide exacto con
 * `env(safe-area-inset-top)` (el Dynamic Island). O sea, en modo standalone
 * Safari ya descuenta la zona segura superior del alto que reporta — si
 * nuestro CSS le suma su propio padding superior encima, la estamos
 * restando dos veces, y ese sobrante queda como hueco vacío en la parte
 * inferior de la pantalla. Se reconstruye el alto real sumando de vuelta
 * `--safe-top` (leído por CSS puro vía env(), ver +html.tsx) al alto medido.
 * En navegadores sin zona segura (desktop, Android) `--safe-top` es 0, así
 * que no cambia nada ahí.
 */
export function useViewportHeightFix() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const viewport = window.visualViewport;

    const setHeight = () => {
      const measured = viewport?.height ?? window.innerHeight;
      const safeTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
      document.documentElement.style.setProperty('--app-height', `${measured + safeTop}px`);
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

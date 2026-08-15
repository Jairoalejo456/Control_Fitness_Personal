import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only. Mantiene --app-height sincronizada con el alto real de pantalla.
 *
 * Se midió con datos reales de dispositivo (panel de Diagnóstico en
 * Configuración) que `visualViewport.height`/`window.innerHeight`, en un mismo
 * iPhone 16 Pro en modo standalone, dieron valores *distintos* en dos aperturas
 * seguidas (812px una vez, 874px —el alto real— la otra) — no hay ningún offset
 * fijo que restarle o sumarle al Dynamic Island, es una medición que a veces se
 * toma **antes de que el WebView standalone termine de expandirse** a su tamaño
 * final justo al arrancar. La solución no es corregir el número con matemática
 * propia (eso rompe el caso en que ya viene bien) sino remedir un par de veces
 * más en los primeros instantes hasta que se asiente, además de seguir
 * escuchando resize/orientationchange/visualViewport para cualquier cambio
 * posterior (rotación, teclado, etc.).
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

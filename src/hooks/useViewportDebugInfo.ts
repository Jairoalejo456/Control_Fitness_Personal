import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type ViewportDebugInfo = {
  windowW: number;
  windowH: number;
  visualViewportW: number | null;
  visualViewportH: number | null;
  safeTop: number;
  safeBottom: number;
  appHeight: string;
};

function readInfo(): ViewportDebugInfo | null {
  if (typeof window === 'undefined') return null;
  const vv = window.visualViewport;
  const rootStyle = getComputedStyle(document.documentElement);
  const parsePx = (value: string) => parseFloat(value) || 0;

  return {
    windowW: window.innerWidth,
    windowH: window.innerHeight,
    visualViewportW: vv?.width ?? null,
    visualViewportH: vv?.height ?? null,
    safeTop: parsePx(rootStyle.getPropertyValue('--safe-top')),
    safeBottom: parsePx(rootStyle.getPropertyValue('--safe-bottom')),
    appHeight: rootStyle.getPropertyValue('--app-height').trim(),
  };
}

/** Web-only: medidas reales de viewport/zona segura leídas en el dispositivo, para diagnóstico. */
export function useViewportDebugInfo(): ViewportDebugInfo | null {
  const [info, setInfo] = useState<ViewportDebugInfo | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const update = () => setInfo(readInfo());
    update();

    const vv = window.visualViewport;
    window.addEventListener('resize', update);
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);

    return () => {
      window.removeEventListener('resize', update);
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
    };
  }, []);

  return info;
}

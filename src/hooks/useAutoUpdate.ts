import { useEffect } from 'react';
import { Platform } from 'react-native';

import { APP_VERSION } from '@/generatedVersion';

const PENDING_RELOAD_KEY = 'cf-personal-pending-update-version';

async function checkForUpdate() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = (await res.json()) as { version?: string };

    if (!data.version || data.version === APP_VERSION) {
      sessionStorage.removeItem(PENDING_RELOAD_KEY);
      return;
    }

    // Ya intentamos recargar una vez para llegar a esta misma versión y seguimos sin
    // coincidir (probablemente el despliegue nuevo aún no propagó del todo). No
    // reintentar en bucle — se resuelve solo la próxima vez que la app vuelva a
    // primer plano.
    if (sessionStorage.getItem(PENDING_RELOAD_KEY) === data.version) return;

    sessionStorage.setItem(PENDING_RELOAD_KEY, data.version);
    window.location.reload();
  } catch {
    // Sin conexión o falla de red: no hacer nada, se reintenta la próxima vez que la app pase a primer plano.
  }
}

/**
 * Web-only: al abrir/volver a la PWA (montaje, foco de ventana o volver de background)
 * compara la versión servida contra la que está corriendo y recarga si cambió.
 */
export function useAutoUpdate() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    checkForUpdate();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkForUpdate);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);
}

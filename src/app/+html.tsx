import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { colors } from '@/theme/tokens';

/**
 * Documento HTML raíz para la exportación web (PWA). Solo corre en el servidor de
 * build durante `expo export --platform web` — no se re-renderiza en el navegador.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Control Fitness Personal — seguimiento diario de un plan de recomposición corporal de 16 semanas." />
        <meta name="theme-color" content={colors.background} />

        {/* Instalable en iOS (Safari → Compartir → Agregar a inicio) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Fitness Personal" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* Instalable en Android/Chrome */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" />

        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { background-color: ${colors.background}; }
              /* Safari en iOS no siempre calcula bien 100%/100vh/100dvh contra el
                 viewport visible real, dejando un hueco en blanco debajo de la tab bar
                 (fija al fondo). --app-height la escribe useViewportHeightFix() con
                 window.innerHeight (JS, soportado en cualquier versión de Safari) apenas
                 carga la app — es la fuente de verdad. 100dvh y 100% quedan como
                 respaldo mientras ese JS no ha corrido o en navegadores sin JS. */
              html, body, #root {
                height: var(--app-height, 100dvh);
                min-height: var(--app-height, 100dvh);
              }
              html {
                overscroll-behavior-y: none;
              }
              /* Zona segura leída directo de env() por CSS puro (sin medirla por JS) —
                 fuente de verdad para el panel de diagnóstico. */
              :root {
                --safe-top: env(safe-area-inset-top, 0px);
                --safe-bottom: env(safe-area-inset-bottom, 0px);
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

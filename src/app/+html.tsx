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
              /* TEMPORAL — diagnóstico visual: si #root no cubre toda la pantalla real,
                 este color imposible de confundir se verá en el sobrante. Quitar después
                 de confirmar. */
              body { background-color: #ff00ff; }
              /* 100dvh, window.innerHeight/visualViewport.height medidos por JS, y
                 position:fixed con bottom:0 fallaron todos en este WebView standalone
                 específico (confirmado con el diagnóstico de fondo magenta — seguía
                 apareciendo con los tres). Se adopta 100lvh (Large Viewport Height, la
                 unidad que representa el viewport en su estado más grande posible) tras
                 confirmar que es la técnica que usa otra PWA propia del usuario ya
                 verificada funcionando en el mismo tipo de dispositivo/contexto. */
              html, body, #root {
                height: 100%;
                height: 100lvh;
                min-height: 100lvh;
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

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
              /* Safari en iOS calcula 100%/100vh contra el viewport "grande" (barra de
                 direcciones oculta), pero al cargar la barra sigue visible — deja un hueco
                 en blanco debajo de la tab bar (fija al fondo) hasta que el usuario hace
                 scroll y Safari recalcula. 100dvh se ajusta en tiempo real al viewport
                 visible real, evitando ese hueco. Se declara después de height:100% para
                 que los navegadores sin soporte de dvh conserven el valor de respaldo. */
              html, body, #root {
                height: 100dvh;
                min-height: 100dvh;
              }
              html {
                overscroll-behavior-y: none;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

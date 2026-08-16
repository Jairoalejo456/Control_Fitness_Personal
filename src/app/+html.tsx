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
                 de confirmar (ver también el outline de #root más abajo). */
              body { background-color: #ff00ff; }
              /* En el iPhone de prueba, window.innerHeight/visualViewport.height dieron
                 valores distintos (812px vs 874px) entre distintas aperturas de la MISMA
                 app standalone — no es que la medición tarde en asentarse, a veces
                 simplemente no llega al valor correcto. Ninguna medición por JS es
                 confiable acá. La solución que no depende de medir nada: #root con
                 position:fixed pegado a los 4 bordes — el navegador lo ajusta él mismo al
                 viewport visible real en todo momento (rotación, teclado, barra de Safari),
                 sin que nuestro código tenga que calcular ni leer ninguna altura.
                 html/body quedan con 100% como base para navegadores muy antiguos. */
              /* -webkit-fill-available es la palabra clave que WebKit definió
                 específicamente para este problema (previa a dvh) — a diferencia de
                 bottom:0 en position:fixed (que en este WebView standalone parece
                 detenerse antes del borde físico real, dejando ver el fondo de body),
                 esto le pide directamente el alto real disponible. Los navegadores que
                 no la soportan ignoran la línea y se quedan con 100% de respaldo. */
              html, body {
                height: 100%;
                height: -webkit-fill-available;
              }
              html {
                overscroll-behavior-y: none;
              }
              #root {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 100vh;
                height: -webkit-fill-available;
                width: auto;
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

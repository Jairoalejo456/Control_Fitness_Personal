# Estado del proyecto — Control Fitness Personal

> Este archivo es la "base de datos" de contexto del proyecto. Está pensado para que
> cualquier sesión de Claude Code (o cualquier persona) que retome este trabajo pueda
> entender en minutos qué se hizo, por qué, y qué falta — sin tener que releer todo el
> historial de chat. Está enlazado desde `CLAUDE.md`, así que se carga automáticamente
> al abrir este repo en Claude Code.
>
> **Regla de mantenimiento**: cada vez que se haga un cambio relevante (nueva
> funcionalidad, decisión de arquitectura, cambio de rumbo), agregar una entrada en la
> sección "Bitácora de cambios" al final, con fecha. No hace falta detallar cada commit,
> solo lo que un futuro lector necesitaría saber para no repetir preguntas ya resueltas.

## Qué es esto

App móvil personal (iOS-first) para seguir un plan de recomposición corporal de 16
semanas: registro diario (peso, cintura, pasos, sueño, calorías, proteína, cardio,
energía, notas), entrenamiento de fuerza con series/reps/RIR, rutina de referencia,
panel de resumen semanal con cumplimiento y recomendaciones, y
configuración/administración de ejercicios.

Es un proyecto **personal y de un solo usuario** — sin backend, sin cuenta, sin otros
usuarios. Todo el estado vive en el teléfono del dueño de la app.

## De dónde viene

El punto de partida fue un **handoff de diseño de alta fidelidad** (prototipo HTML +
capturas de pantalla + datos de la rutina extraídos del Excel original del usuario),
subido como zip al inicio de este trabajo. Ese material queda archivado en
`design/` dentro de este mismo repo:

- `design/handoff-README.md` — especificación completa del diseño (sistema "Nocturne",
  las 8 pantallas, interacciones, modelo de datos, reglas de negocio exactas).
- `design/data-reference.md` — la rutina oficial de 16 semanas tal como estaba en el
  Excel original (ejercicios, series, reps, descansos, notas técnicas).
- `design/Fitness Tracker.dc.html` — el prototipo funcional de referencia (no es
  código de producción, solo para ver el look-and-feel).
- `design/screenshots/` — una captura de cada pantalla del diseño original.

**Cuando algo del comportamiento de la app no esté claro, la fuente de verdad es
`design/handoff-README.md` y `design/data-reference.md`**, no la memoria de una
conversación anterior.

## Decisiones tomadas (y por qué)

- **Stack: React Native + Expo** (managed workflow, SDK 57, TypeScript, Expo Router).
  Se eligió sobre SwiftUI nativo porque el entorno de desarrollo original (sesión en la
  nube, sin Mac/Xcode) no podía compilar ni probar SwiftUI; Expo sí, vía Expo Go.
- **Almacenamiento 100% local** (Zustand + AsyncStorage, todo bajo una sola clave). Sin
  backend — decisión explícita del usuario, uso personal en un solo teléfono.
- **Extras agregados sobre el diseño original** (el handoff no los pedía, se sumaron a
  petición del usuario):
  1. Editar registros de días pasados (la pantalla "Hoy" original solo permitía el día
     actual).
  2. Exportar/importar datos como respaldo JSON (ya que no hay nube).
  3. Gráficas de tendencia de peso/cintura en el Panel.
  4. **No** se agregó bloqueo con código/Face ID (evaluado y descartado).
- **Sin PR abierto todavía** — el usuario no lo ha pedido explícitamente. Todo el
  trabajo vive commiteado directo en la rama `claude/github-connection-tq25hr`.

## Arquitectura (mapa rápido)

```
src/
  app/            Pantallas y navegación (Expo Router; carpeta (tabs) = las 5 tabs fijas)
  theme/tokens.ts Colores, tipografía, espaciado, animación — fieles al sistema "Nocturne"
  types/models.ts Modelo de datos completo (TypeScript)
  data/           Datos semilla: rutina oficial de 16 semanas, metas de pasos, config por defecto
  logic/          Lógica de negocio en funciones PURAS (sin React/RN) + tests Jest
  store/          appStore.ts (estado persistido) + uiStore.ts (estado UI efímero) — Zustand
  services/backup.ts   Exportar/importar respaldo JSON
  hooks/usePanelData.ts   Combina store + logic para la pantalla Panel
  components/     UI reutilizable (ui/) y específica por pantalla (daily/, training/, config/, panel/)
```

**Regla de arquitectura clave**: el store solo guarda datos fuente (registros diarios,
sesiones de ejercicio, config, rutina personalizada). Nada derivado se persiste
(promedios, cumplimiento, recomendaciones) — todo eso se recalcula en caliente desde
`src/logic/` cuando la UI lo necesita. Evita bugs de caché desactualizado.

**Reglas de negocio no obvias que hay que respetar** (están todas testeadas en
`src/logic/__tests__/`):
- Un campo no registrado se guarda `null`, nunca `0`. Los promedios excluyen los `null`
  del cálculo y del conteo — nunca `valor || 0`.
- Los cumplimientos semanales (pasos/sueño/calorías/proteína) se dividen entre los días
  **con dato**, no siempre entre 7.
- El calentamiento fijo de los días de fuerza no cuenta para los minutos de cardio
  semanal.
- Los umbrales de confianza del promedio (peso 1-2→provisional/3+→semanal, cintura
  1→provisional/2+→semanal) están explícitos en el diseño; para pasos/sueño/calorías/
  proteína se asumió el mismo patrón que peso por no estar detallado — si el usuario
  confirma algo distinto, ajustar `src/logic/averages.ts` (`PROVISIONAL_MAX`).

## Cómo correr el proyecto

```bash
npm install
npm start        # levanta el servidor de desarrollo (requiere Expo Go en el iPhone,
                  # misma red wifi que el computador)
npm test          # tests de la lógica de negocio
npm run typecheck # chequeo de tipos
```

### Sobre probarlo en el iPhone

Este proyecto se desarrolló en una **sesión de Claude Code en la nube**, sin acceso a
Xcode ni a la red del usuario. Eso descarta:
- Probar en simulador iOS (no hay Mac en el entorno de desarrollo remoto).
- Modo túnel de Expo (`expo start --tunnel`) — **confirmado que no funciona** en ese
  entorno: la política de red del contenedor bloquea la conexión saliente de ngrok
  (timeout sin ningún intento visible en el proxy). No vale la pena reintentarlo desde
  ahí; es un bloqueo de red, no un problema transitorio.

Por eso el flujo real de prueba/uso es: el usuario corre el proyecto **desde su propio
Mac** (con Xcode ya instalado), y usa **Expo Go** en su iPhone.

### Publicación con EAS Update (en progreso)

Para que el usuario no dependa de tener el Mac prendido corriendo `npm start` cada vez
que quiera usar la app, se está configurando **EAS Update**: el usuario publica el
proyecto una vez a los servidores de Expo (gratis, requiere cuenta en expo.dev) y desde
ahí puede abrirlo en Expo Go en cualquier momento sin servidor local corriendo — solo
necesita internet en el teléfono.

Esto requiere login interactivo (`eas login`) que **no se puede hacer desde una sesión
de Claude Code remota** — debe correrlo el usuario en su Mac. Lo que sí se dejó listo
desde el código:
- `expo-updates` instalado como dependencia.
- Falta correr en el Mac del usuario: `eas login`, `eas init`, `eas update:configure`,
  y luego `eas update` para publicar cada vez que haya cambios nuevos.

Si en una sesión futura hay que retomar esto, revisar si el usuario ya corrió esos
comandos (buscar `extra.eas.projectId` y el bloque `updates` en `app.json` — si ya
existen, el proyecto ya está vinculado a EAS y solo falta seguir publicando).

**Camino futuro, si el usuario quiere una app "de verdad" con ícono propio (sin pasar
por Expo Go)**: requiere EAS Build + instalación vía Xcode (gratis, pero expira cada 7
días) o cuenta de desarrollador Apple de pago (~$99/año, vía TestFlight, dura todo el
año). No se ha empezado — es una posible siguiente fase si el usuario lo pide.

## Qué falta / posibles siguientes pasos

- [ ] Terminar de configurar EAS Update (pendiente de que el usuario corra los
      comandos en su Mac — ver sección de arriba).
- [ ] Verificación real en dispositivo (todo lo hecho hasta ahora se verificó con
      `tsc`, `jest`, y `expo export --platform web`; falta que el usuario confirme que
      los gestos nativos —swipe-to-delete, drag-to-reorder, swipe-back, selector de
      fecha, hoja para compartir— se sienten bien en su iPhone real).
- [ ] Nada más está pendiente del alcance original — las 9 fases del plan inicial
      (setup, datos/lógica, onboarding/config, Hoy, Entreno/Sesión completada,
      Rutina/Administrar ejercicios, Panel, respaldo, pulido) están completas.

## Bitácora de cambios

### 2026-08-14 — Construcción inicial completa
Se construyó la app completa desde cero (repo estaba vacío salvo un README) siguiendo
el handoff de diseño: las 8 pantallas, sistema de diseño "Nocturne", modelo de datos y
lógica de negocio (con tests), gestos nativos (swipe-to-delete, drag-to-reorder,
swipe-back), y los 3 extras acordados (editar días pasados, exportar/importar JSON,
gráficas de tendencia). Verificado con `tsc --noEmit`, `jest` (24 tests) y
`expo export --platform web`. Commiteado y pusheado a
`claude/github-connection-tq25hr`.

Se intentó levantar un servidor de desarrollo en modo túnel (`expo start --tunnel`)
para que el usuario pudiera probar la app de inmediato desde Expo Go sin instalar nada
localmente — confirmado que no es viable desde este entorno remoto (bloqueo de red al
conectar con los servidores de ngrok). Se le indicó al usuario correr el proyecto desde
su propio Mac en su lugar.

Se instaló `expo-updates` como paso preparatorio para configurar EAS Update (el usuario
pidió no depender de tener el Mac prendido para usar la app). Falta que el usuario
complete el login/configuración de EAS desde su Mac.

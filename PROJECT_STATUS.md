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

### Camino elegido: app nativa real vía Xcode (en progreso)

Se le explicaron al usuario las 3 opciones (1. Expo Go + servidor local, 2. Expo Go +
EAS Update sin servidor local, 3. app nativa real con ícono propio sin pasar por Expo
Go) — **eligió la opción 3**, ya que tiene Xcode instalado. Se descartó EAS Update como
destino final (solo se había dejado `expo-updates` instalado como preparación de la
opción 2, que ya no es el camino; no se ha quitado la dependencia porque no estorba).

Se agregó `ios.bundleIdentifier: "com.jairoalejo456.controlfitnesspersonal"` en
`app.json` — es obligatorio para compilar de forma nativa (Expo Go no lo necesita, por
eso no estaba desde el inicio).

**Flujo que debe correr el usuario en su Mac** (no se puede hacer desde una sesión de
Claude Code remota — requiere Xcode y el iPhone conectado por cable):
```bash
git pull origin claude/github-connection-tq25hr
npm install
npx expo prebuild --platform ios   # genera la carpeta ios/ (proyecto Xcode real)
npx expo run:ios --device          # compila e instala directo en el iPhone conectado
```
En el primer `run:ios --device` es probable que Xcode pida iniciar sesión con el Apple
ID del usuario (Xcode → Settings → Accounts) y elegir un "team" personal gratis para la
firma de código. Con cuenta Apple gratis (sin pagar los $99/año), la app instalada
expira a los 7 días y hay que repetir `expo run:ios --device` para renovarla — el
usuario ya fue informado de esta limitación y la aceptó.

Si en una sesión futura hay que retomar esto: revisar si ya existe la carpeta `ios/`
commiteada (normalmente NO se commitea, queda en `.gitignore` — ver si el usuario pidió
lo contrario) y si el usuario reporta algún error específico de firma/certificados en
Xcode, que es la parte más propensa a fricción de este flujo.

**Si más adelante el usuario quiere evitar el re-instalado cada 7 días** sin pagar la
cuenta de desarrollador: no hay atajo gratuito en iOS para eso — es una restricción de
Apple, no de Expo. La alternativa sin pagar sería volver a EAS Update (opción 2, dentro
de Expo Go) o pagar la cuenta de $99/año para distribución permanente vía TestFlight.

## Versión web / PWA (además de la app nativa)

Como Expo trae soporte web integrado (react-native-web + Expo Router), se agregó una
**segunda forma de usar la misma app, sin tocar Xcode**: una PWA (Progressive Web App)
desplegable en Vercel. Es el mismo código fuente — no hay dos proyectos ni dos bases de
código, solo un target de build adicional (`--platform web`).

**Por qué se hizo**: el usuario pidió una forma de actualizar la app más parecida a una
web normal (editar → publicar → recargar), sin el proceso de recompilar con Xcode cada
vez. La PWA cubre eso — cualquier cambio de código se refleja con un redeploy en Vercel
y un refresh del navegador, sin cable, sin Xcode, sin esperar 7 días. La app nativa
(instalada vía Xcode) sigue siendo la opción "offline-first"/con ícono en el dock del
sistema; ahora conviven las dos.

**Adaptaciones necesarias para que funcione bien en web** (los módulos nativos de Expo
no todos tienen implementación web):
- `@react-native-community/datetimepicker` no existe en web → se creó
  `src/components/ui/HtmlDateInput.tsx` (un `<input type="date">` HTML real vía
  `createElement`, no JSX, para no pelear con los tipos DOM en un proyecto RN) y se usa
  como rama `Platform.OS === 'web'` en `DatePickerField.tsx` y `DailyLogDateHeader.tsx`.
- `expo-file-system` es un stub vacío en web (`console.warn` y ya) → `src/services/backup.ts`
  ahora tiene una función unificada `exportBackup()` que en web dispara una descarga de
  archivo directa (Blob + `<a download>`), y en iOS/Android sigue usando
  `expo-sharing`. `pickAndImportFile()` en web lee el `File` del navegador directo
  (viene en `asset.file` desde `expo-document-picker`, que sí tiene shim web).
- `Alert.alert` de React Native es **no-op en react-native-web** (no hace nada, ni
  siquiera un warning) → se creó `src/utils/platformAlert.ts` (`confirmAsync`/`notify`)
  que usa `window.confirm`/`window.alert` en web y `Alert.alert` nativo en
  iOS/Android. `BackupCard.tsx` se actualizó para usar esto — antes, el diálogo de
  confirmación de "Importar" simplemente no aparecía en web.

**PWA instalable**: se agregó `public/manifest.json` (nombre, colores, íconos) y
`src/app/+html.tsx` (documento HTML raíz de Expo Router para web — ahí van los meta
tags de `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`, link al
manifest). Los íconos (incluye un ícono nuevo de mancuerna con los colores de la app,
pedido por el usuario) se generaron con un SVG propio rasterizado vía `cairosvg`
(`assets/images/icon.png` y variantes, más `public/icons/*` para la PWA) — reemplazó el
ícono genérico de Expo que traía el template. Este mismo ícono también quedó como el de
la app nativa de Xcode (un solo set de assets para ambas).

**Verificado**: `expo export --platform web` compila sin errores, se sirvió localmente
y se probó con Playwright (captura de Onboarding/Hoy/Panel, sin errores de consola) —
coincide visualmente con el diseño original.

**Despliegue en Vercel — completado y funcionando en producción.**
URL pública: **https://control-fitness-personal-jairo345.vercel.app** (también
`https://control-fitness-personal.vercel.app`). El usuario conectó el proyecto a
Vercel por su cuenta; luego el usuario conectó el **MCP de Vercel** a esta sesión de
Claude Code, lo que permitió diagnosticar y resolver el despliegue directamente por
API (sin necesidad de que el usuario hiciera clics en el dashboard, salvo dos ajustes
puntuales que la API no expone).

Dos problemas reales encontrados y su solución (útil si se reconfigura este proyecto
de Vercel desde cero en el futuro):
1. **El proyecto de Vercel estaba conectado a la rama `main`** de GitHub (creada
   automáticamente al importar el repo), pero *todo* el trabajo real vivía solo en
   `claude/github-connection-tq25hr` — `main` seguía teniendo únicamente el "Initial
   commit" vacío (sin `package.json`), de ahí el error `ENOENT` al buscar
   `package.json`. Solución aplicada (con permiso explícito del usuario): se hizo
   `git push origin claude/github-connection-tq25hr:main` (fast-forward simple, sin
   conflictos posibles ya que `main` era un ancestro directo) para que `main` quedara
   idéntica a la rama de trabajo. Desde entonces cada push a `claude/github-connection-tq25hr`
   se refleja también en `main` con el mismo comando, para que el despliegue
   automático de Vercel siga funcionando.
2. **El campo "Install Command" del proyecto en Vercel estaba con "Override" activado
   y vacío**, lo que hacía que Vercel saltara `npm install` por completo ("Skipping
   'install' command...") y el build fallara con `expo: command not found`. El
   usuario lo corrigió manualmente en Settings → Build and Deployment → Install
   Command (dejándolo en blanco con Override apagado, o `npm install` explícito) — no
   hay forma de cambiar esto por API con las herramientas del MCP de Vercel
   disponibles.

Una vez corregidos ambos, un deploy disparado con la herramienta MCP
`create_git_project` (que reusa el proyecto existente) completó bien: `npm install`
(934 paquetes, ~23s) + `expo export --platform web` (~2 min en la infra de Vercel,
notablemente más lento que local) → 15 rutas estáticas generadas correctamente.
Verificado con `web_fetch_vercel_url` que la URL de producción responde 200 con el
HTML correcto (manifest, meta tags, bundle JS).

Si se retoma trabajo en este proyecto de Vercel a futuro: el MCP de Vercel conectado a
esta sesión no tiene una herramienta para cambiar "Install Command"/"Build
Command"/"Production Branch" por API — esos tres campos solo se pueden verificar por
API (`get_project`) pero se editan a mano en el dashboard. Si un build empieza a fallar
de nuevo con "Skipping install command" o construye la rama equivocada, revisar esos
dos ajustes primero.

## Qué falta / posibles siguientes pasos

- [x] **App nativa instalada y funcionando en el iPhone real del usuario** (ver
      bitácora 2026-08-14/15) — confirmado que abre y funciona sin Mac, wifi, ni
      Expo Go de por medio (build Release con JS embebido).
- [ ] Probar a fondo el uso diario real: registrar días completos, marcar sesiones de
      fuerza, ver que el Panel calcule bien con datos reales (todo lo hecho hasta
      ahora se verificó con `tsc`, `jest`, y `expo export --platform web`, más esta
      instalación real — falta uso prolongado para detectar detalles de UX).
- [ ] **Recordatorio importante para el usuario**: con cuenta Apple gratis, la app
      instalada expira cada 7 días — hay que repetir
      `npx expo run:ios --device --configuration Release` desde el Mac para renovarla
      (ver sección "Camino elegido" más abajo). Recomendado exportar un respaldo JSON
      desde Configuración antes de cada renovación, por seguridad.
- [ ] Nada más está pendiente del alcance original — las 9 fases del plan inicial
      (setup, datos/lógica, onboarding/config, Hoy, Entreno/Sesión completada,
      Rutina/Administrar ejercicios, Panel, respaldo, pulido) están completas.
- [ ] **PWA lista en el código, falta que el usuario la conecte a Vercel** (ver sección
      "Versión web / PWA" arriba) — es un flujo de solo navegador, no necesita Mac.

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

### 2026-08-14 — Cambio de rumbo: app nativa real en vez de EAS Update
El usuario se confundió sobre qué estábamos construyendo (pensó que ya estábamos
armando la app nativa en Xcode). Se le explicaron las 3 opciones posibles con una
tabla comparativa y, como ya tiene Xcode instalado, eligió ir directo por la app nativa
real con ícono propio (opción 3), no EAS Update. Se agregó `ios.bundleIdentifier` a
`app.json` (obligatorio para build nativo) y se le dieron los comandos
(`expo prebuild --platform ios` + `expo run:ios --device`) para correr desde su Mac.
Ver la sección "Camino elegido: app nativa real vía Xcode" más arriba para el detalle
completo y qué revisar si se retoma esto en otra sesión.

### 2026-08-14/15 — Instalación nativa completada con éxito en el iPhone real
Se guio al usuario paso a paso (por chat, sin acceso remoto a su Mac — ver nota abajo)
para llevar el flujo de la sección "Camino elegido" hasta el final. Quedó
**funcionando: la app abre en el iPhone del usuario con su propio ícono, sin Mac, sin
wifi especial y sin Expo Go**. Obstáculos reales encontrados y cómo se resolvieron (útil
si otro usuario/sesión repite este flujo):

1. **Faltaba Homebrew y CocoaPods** en el Mac del usuario → `expo prebuild` fallaba al
   instalar pods (`spawn brew ENOENT`). Se instaló Homebrew primero
   (`/bin/bash -c "$(curl -fsSL .../install.sh)"`), se agregó al PATH (`brew shellenv`
   en `.zprofile`), y luego `brew install cocoapods`. Después `expo prebuild --platform
   ios --clean` sí completó.
2. **El iPhone no aparecía en la lista de `expo run:ios --device`** → el dispositivo
   solo estaba "Discovered", no emparejado. Se resolvió reconectando el cable con el
   iPhone desbloqueado y aceptando el diálogo "Confiar en este computador" en el
   teléfono.
3. **Xcode pedía activar "Developer Mode"** en el iPhone (Settings → Privacy &
   Security → Developer Mode) — obligatorio desde iOS 16+ para instalar builds fuera
   de la App Store. Requiere reiniciar el teléfono.
4. **Primer intento de `run:ios --device` se ejecutó accidentalmente contra el
   Simulador** (el usuario presionó Enter sobre la opción resaltada por defecto sin
   querer). No hizo daño, solo confirmó que el código compilaba.
5. **Tras el prebuild, `run:ios --device` instaló la app pero falló al abrirla**:
   `"invalid code signature... profile has not been explicitly trusted by the user"`.
   Se resolvió en el iPhone: Configuración → General → VPN y administración de
   dispositivos → tocar el perfil del Apple ID del usuario → Confiar.
6. **Build de Debug**: al abrir, mostraba "No script URL provided" (la Terminal se
   había cerrado, matando Metro) y luego, al reconectar con `npx expo start
   --dev-client`, un aviso azul de "Refrescando" intermitente — **normal en modo
   Debug**, la app sigue conectada en vivo al Metro del Mac. No bloqueaba el uso.
7. **Solución definitiva**: `npx expo run:ios --device --configuration Release` —
   compila con el JS embebido dentro de la app (no depende de Metro/Mac en
   absoluto). Confirmado por el usuario: apagó el wifi del iPhone y la app abrió y
   funcionó normal. **Este es el comando a usar de ahora en adelante**, tanto para la
   instalación inicial como para renovar cada 7 días.

**Nota de proceso importante**: esta sesión de Claude Code es remota (sin acceso al
Mac del usuario) — todo este flujo se hizo guiando al usuario por chat, pidiéndole
capturas de pantalla de la Terminal/Xcode en cada paso e indicándole qué comando o
botón seguía. Si se retoma soporte de instalación en el futuro, ese sigue siendo el
patrón a seguir (no asumir que se puede ejecutar nada directamente en la máquina del
usuario).

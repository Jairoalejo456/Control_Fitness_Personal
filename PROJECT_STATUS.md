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
- [x] **PWA desplegada y funcionando en producción en Vercel** (ver sección "Versión
      web / PWA" y bitácora correspondiente).
- **Decisión 2026-08-15: de ahora en adelante el desarrollo se enfoca solo en la
  PWA.** El usuario decidió dejar de lado el flujo nativo por Xcode (recompilar cada
  7 días con cuenta Apple gratis era la fricción principal) — la PWA en Vercel es
  ahora el único canal de distribución activo. El código de la app nativa (carpeta
  `ios/` si se genera, `ios.bundleIdentifier` en `app.json`) queda intacto en el
  repo por si se retoma en el futuro, pero no se le sigue dando soporte activo ni se
  espera que el usuario vuelva a correr `expo run:ios`. Si se retoma, la sección
  "Camino elegido: app nativa real vía Xcode" más abajo sigue siendo válida como
  referencia histórica de cómo se hizo.
- [ ] Probar a fondo el uso diario real: registrar días completos, marcar sesiones de
      fuerza, ver que el Panel calcule bien con datos reales (todo lo hecho hasta
      ahora se verificó con `tsc`, `jest`, y `expo export --platform web` — falta uso
      prolongado para detectar detalles de UX).
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

### 2026-08-15 — Pulido de pantallas: safe areas, bounce, espacios vacíos, animación de tabs

El usuario pidió un pase de pulido general con 4 reglas aplicables a **todas** las
pantallas: (1) rebote elegante en los límites de scroll, (2) medidas fieles a iPhone
respetando zonas seguras, (3) eliminar espacios vacíos o texto apretado, (4)
animación básica al cambiar de tab. Cambios:

- **`src/components/ui/Screen.tsx`** (wrapper compartido por Hoy/Entreno/Rutina/Panel/
  Config/Onboarding): el padding superior/inferior ahora usa
  `useSafeAreaInsets()` en vez de valores fijos (`insets.top + spacing.xl`,
  `insets.bottom + 90` para dejar espacio a la tab bar). El `ScrollView` tiene
  `bounces`/`alwaysBounceVertical` explícitos. La animación de entrada dejó de ser
  "solo una vez al montar" (`FadeInUp` estático) y pasó a dispararse cada vez que la
  pantalla recupera el foco, usando `useIsFocused` (importado de `expo-router`, que
  re-exporta React Navigation — **no** instalar `@react-navigation/native` aparte, no
  es dependencia directa de este proyecto) + Reanimated (`useSharedValue`/
  `withTiming`), así las 5 tabs tienen una transición sutil al navegar entre ellas.
  `Screen` ahora acepta `contentContainerStyle` opcional para que pantallas
  específicas puedan pedir `flex: 1` cuando necesitan centrar contenido corto.
- **`src/app/administrar-ejercicios.tsx`** y **`src/app/sesion-completada.tsx`** (no
  usan `Screen`, tienen layout propio): mismo tratamiento manual de
  `useSafeAreaInsets()` para el padding superior/inferior en vez de valores fijos
  (`paddingTop: 56` hardcodeado, etc.), y bounce explícito en el
  `DraggableFlatList` de administrar ejercicios.
- **Bug real encontrado (regla 3)**: en `entreno.tsx`, los días de cardio/descanso
  mostraban una sola tarjeta pegada arriba con un espacio vacío enorme debajo
  (ocupaba una fracción de la pantalla). Se corrigió envolviendo esa tarjeta en un
  contenedor `flex:1, justifyContent:'center'` (activado solo para días no-fuerza vía
  `contentContainerStyle={isFuerza ? undefined : styles.fillContainer}` en `Screen`),
  y se le agregó un título ("Día de descanso") al mensaje de descanso, antes muy
  escueto. Mismo problema y mismo arreglo aplicado a `rutina.tsx` en el día de
  descanso (agrupando la tarjeta del día + la tarjeta "Progresiones" siempre presente
  en un solo bloque centrado, ya que los días de fuerza siguen llenando la pantalla
  de forma natural con la lista de ejercicios y no necesitan el centrado).
- **Regresión encontrada y corregida al aplicar `flex:1` en `rutina.tsx`**: el
  `ScrollView` horizontal de `DayTabs` (usado también en Administrar Ejercicios) se
  estiraba verticalmente hasta ocupar casi toda la pantalla cuando quedaba como
  hijo de un contenedor padre con `flex:1` — comportamiento específico de
  `react-native-web` con `ScrollView` anidado sin altura fija. Se arregló agregando
  `style={{ flexGrow: 0, flexShrink: 0 }}` al `ScrollView` de `DayTabs.tsx` para que
  no herede una altura estirada del padre. **Si se vuelve a usar el patrón
  `contentContainerStyle={{flex:1}}` en otra pantalla que también use `DayTabs` (o
  cualquier `ScrollView` anidado), revisar este mismo problema.**
- Verificado con `tsc --noEmit` (sin errores) y `jest` (24 tests, todos pasan), más
  capturas de Playwright a 390×844 (viewport iPhone) de Hoy, Entreno (cardio y
  descanso), Rutina (fuerza, cardio y descanso) y el fondo de Config — todas con
  buen espaciado, sin texto apretado ni huecos vacíos, y `DayTabs` con su tamaño
  normal en todos los casos.
- **Pendiente de verificar en dispositivo real**: la animación de transición entre
  tabs es visual/temporal, no se puede confirmar con capturas estáticas — el código
  se revisó y debería disparar correctamente (`useIsFocused` cambia a `true` en cada
  cambio de tab, lo que resetea y vuelve a correr `withTiming`), pero falta
  confirmación visual en vivo (Expo Go, web, o la app nativa).
- **Recordatorio para el usuario**: estos cambios están en el código fuente
  compartido por la PWA y la app nativa. La PWA los reflejará automáticamente en el
  próximo deploy de Vercel; la app nativa instalada en el iPhone necesita un nuevo
  `npx expo run:ios --device --configuration Release` desde el Mac para incluirlos
  (no se actualiza sola).

### 2026-08-15 — Enfoque exclusivo en PWA + auto-actualización al abrir

El usuario decidió que de ahora en adelante **solo se trabaja sobre la PWA** (ver
nota en "Qué falta" más arriba) y pidió que la app se actualice sola cada vez que la
abre en el iPhone, sin tener que hacer nada manual (ni un pull-to-refresh, ni
reinstalar). Se implementó un mecanismo de detección de versión + recarga
automática, sin usar Service Worker (se evitó a propósito por la complejidad extra
de invalidación de caché que trae, innecesaria para una PWA sin soporte offline):

- **`scripts/generate-version.js`**: en cada build (`npm run build:web`, y también
  vía `postinstall` después de `npm install`) genera un timestamp ISO único y lo
  escribe en dos lugares: `src/generatedVersion.ts` (constante `APP_VERSION`,
  queda **embebida dentro del bundle JS** en tiempo de build) y `public/version.json`
  (archivo estático que Expo copia a `dist/version.json`, o sea que queda servido en
  producción como `/version.json`, **fuera** del bundle JS). Ambos archivos están en
  `.gitignore` — se regeneran solos, no se commitean.
- **`src/hooks/useAutoUpdate.ts`** (nuevo, solo corre en `Platform.OS === 'web'`): al
  montar la app, y cada vez que la pestaña/PWA vuelve a primer plano
  (`visibilitychange` + `focus`), hace `fetch('/version.json', {cache: 'no-store'})`
  y compara contra el `APP_VERSION` embebido en el bundle que ya está corriendo. Si
  no coinciden (o sea, hay un deploy más nuevo en el servidor), hace
  `window.location.reload()`. Conectado en `src/app/_layout.tsx` con
  `useAutoUpdate()`.
- **Guard contra bucle de recarga infinito** (bug real encontrado y corregido
  durante las pruebas): la primera versión de `checkForUpdate` recargaba sin
  condición alguna cada vez que detectaba una diferencia — en pruebas con
  Playwright esto causó **9 recargas en cadena** cuando el `version.json` cambiaba
  pero el bundle JS servido seguía siendo el viejo (ej. mientras un deploy de Vercel
  todavía está propagando). Se corrigió guardando en `sessionStorage` qué versión ya
  se intentó alcanzar (`cf-personal-pending-update-version`): si tras recargar
  sigue sin coincidir la misma versión, no se reintenta en bucle — se espera al
  próximo evento de foco/visibilidad. Verificado con un test de Playwright que
  simula un deploy real completo (bundle nuevo + version.json nuevo) sirviendo
  primero el build viejo y luego reemplazando los archivos en disco en caliente:
  la app recarga **exactamente una vez** y queda estable en la versión nueva, sin
  bucle.
- **`vercel.json`**: se agregó configuración de `headers` — `Cache-Control:
  no-cache, must-revalidate` para todas las rutas (fuerza que el navegador/iOS
  siempre revalide el HTML y `version.json` contra el servidor en vez de servir una
  copia cacheada vieja), y `Cache-Control: public, max-age=31536000, immutable`
  específicamente para `/_expo/static/*` (los archivos JS llevan hash en el nombre
  por cada build, así que cachearlos "para siempre" es seguro y mejora la
  velocidad de carga). Esto es la otra mitad necesaria del mecanismo: sin este
  header, aunque el JS detecte una versión nueva y haga `reload()`, el navegador
  podría servir el `index.html` viejo desde su caché local en vez de pedirlo de
  nuevo al servidor.
- Verificado con `tsc --noEmit`, `jest` (24 tests) y dos pruebas end-to-end con
  Playwright (bucle corregido + recarga única en un deploy simulado completo).
- **Qué significa esto para el uso diario**: cada vez que se hace push a `main` (y
  por lo tanto Vercel redespliega), la próxima vez que el usuario abra la PWA desde
  el ícono en su iPhone —o vuelva a ella tras cambiar de app— la va a encontrar
  actualizada sola, como máximo con un parpadeo de recarga, sin tener que hacer
  nada manual.

### 2026-08-15 — Fix: hueco en blanco debajo de la tab bar en iPhone real

El usuario reportó (con captura de pantalla desde su iPhone real) un espacio vacío
grande y "roto" debajo de la barra de tabs inferior, en vez de terminar limpio contra
la barra blanca del home indicator.

**Causa identificada**: el reset de estilos de Expo para web fija
`html, body, #root { height: 100% }`. En Safari de iOS, `100%`/`100vh` se calcula
contra el viewport "grande" (asumiendo que la barra de direcciones de Safari está
oculta), pero al cargar la página esa barra sigue visible. Cuando el usuario hace
scroll dentro de la app y Safari oculta su barra de direcciones automáticamente, el
viewport real crece — pero la altura de nuestra página ya se había fijado antes con el
valor viejo, y la tab bar (fija al fondo vía posicionamiento absoluto/fixed) no se
reacomoda con ese cambio. El resultado es exactamente el hueco negro reportado. Es un
bug conocido y muy documentado de Safari iOS con `position: fixed` + barra de
direcciones dinámica, no un error de cálculo del componente de tabs en sí (se revisó
su lógica de `insets.bottom` en `node_modules` y es la fórmula estándar correcta:
altura base 49pt + `insets.bottom`).

**Fix**: en `src/app/+html.tsx` se agregó una regla CSS con `100dvh` (dynamic viewport
height, unidad diseñada específicamente para este problema, soportada desde iOS
Safari 15.4+) sobre `html, body, #root`, declarada después del reset de Expo para que
la sobreescriba por orden de cascada, dejando `height: 100%` como respaldo automático
en navegadores sin soporte de `dvh`. También se agregó `overscroll-behavior-y: none`
en `html` para evitar el rebote de la página completa (cada pantalla ya maneja su
propio scroll/rebote internamente vía `Screen.tsx`).

Verificado con `tsc --noEmit`, `jest` (24 tests) y una captura de Playwright del fondo
de Hoy (sin regresión visual). **No se pudo reproducir el bug original en Chromium de
escritorio** porque no tiene la barra de direcciones dinámica de Safari — el fix se
basa en la causa raíz documentada, pero su confirmación definitiva depende de que el
usuario lo vea corregido en su iPhone real tras el próximo deploy.

### 2026-08-15 — El fix de 100dvh no fue suficiente: tab bar con altura explícita

El usuario confirmó que, tras el deploy del fix anterior, el problema seguía igual
("sigue igual, no cambió nada") — con una captura nueva que además mostraba algo
peor: la tarjeta "Proteína" quedaba tapada a medias por la tab bar, y debajo de los
íconos/etiquetas de la tab bar seguía habiendo un bloque de espacio vacío grande.

Se revisó `getTabBarHeight` en `@react-navigation/bottom-tabs` (vía
`node_modules/expo-router/.../BottomTabBar.js`): calcula la altura de la tab bar como
`49pt (alto base iOS) + insets.bottom`, y por separado aplica `paddingBottom:
insets.bottom` — la fórmula en sí es la estándar correcta. Eso apunta a que el
problema real es que `insets.bottom`, leído por `useSafeAreaInsets()` en este
navegador/dispositivo específico, se está devolviendo con un valor mucho más grande
de lo normal (el home indicator real de cualquier iPhone actual son ~34pt) — lo cual
infla tanto la altura de la tab bar (dejando ese bloque vacío bajo los íconos) como,
potencialmente, desincroniza el padding inferior que reserva `Screen.tsx` para que el
contenido no quede tapado.

**Fix (más robusto, no depende de que la librería adivine bien)**: se creó
`src/hooks/useBottomInset.ts` — un wrapper sobre `useSafeAreaInsets()` que topa
`insets.bottom` a un máximo de 40pt (`Math.min(insets.bottom, 40)`), ya que ningún
iPhone real necesita más que eso para el home indicator. Se usa en dos lugares que
antes calculaban esto por separado y podían desincronizarse:
- **`src/app/(tabs)/_layout.tsx`**: ahora fija `tabBarStyle.height` y
  `tabBarStyle.paddingBottom` explícitamente con el inset topado, en vez de dejar que
  `@react-navigation/bottom-tabs` calcule su propia altura internamente (esto último
  se sigue pudiendo hacer porque la librería aplica `tabBarStyle` como el último
  elemento del array de estilos, así que sobreescribe su propio cálculo).
- **`src/components/ui/Screen.tsx`**: el `paddingBottom` del contenido scrolleable
  ahora usa este mismo inset topado en vez del `insets.bottom` crudo, para que
  siempre quede en sync con la altura real de la tab bar.

Verificado con `tsc --noEmit`, `jest` (24 tests) y una captura de Playwright del
fondo de Hoy (tab bar del tamaño esperado, sin hueco ni overlap). **Sigue sin poder
reproducirse el bug exacto en Chromium de escritorio** porque no expone insets de
zona segura — la confirmación real depende de que el usuario lo vea en su iPhone
después de este deploy. Si el problema persistiera incluso con este límite duro de
40pt, el siguiente paso sería sospechar de un problema de caché en el dispositivo
(que no esté cargando el build nuevo) antes de seguir ajustando el cálculo de
insets.

### 2026-08-15 — Tampoco era el tope de insets: 100dvh no soportado, fix con window.innerHeight

Se verificó que el deploy del fix anterior (tope de 40pt) sí estaba en producción
(`version.json` cambió) y el usuario confirmó, con capturas frescas, que el problema
seguía **igual** incluso así. Pidiéndole una captura completa (desde la hora real
hasta el borde físico del teléfono, sin recortar) del estado actual, se confirmó que
el bloque de espacio vacío es mucho más grande que cualquier home indicator — y que
aparece **desde que abre la app, sin necesidad de scroll** (descarta del todo la
teoría de la barra de direcciones dinámica de Safari revelándose al hacer scroll).

Esto redirigió el diagnóstico: el problema no es que la tab bar mida mal (ya estaba
topada a 40pt como máximo) — es que **toda la app (`#root`) está renderizando más
corta que la pantalla real del dispositivo**, dejando expuesto el `background-color`
del `body` debajo de todo, incluida la tab bar. La sospecha inmediata: `100dvh` (el
fix del commit anterior) simplemente no está soportado o se calcula mal en la
versión de Safari del iPhone del usuario — si el navegador no reconoce el valor
`100dvh`, esa declaración CSS se descarta silenciosamente y el navegador se queda con
el `height: 100%` original de `#expo-reset`, es decir, el fix anterior no hacía nada
en ese dispositivo específico.

**Fix**: se abandonó depender de cualquier unidad de viewport CSS (`%`, `vh`, `dvh`)
para la altura de `html`/`body`/`#root`, a favor de medir `window.innerHeight`
directamente por JavaScript — soportado sin excepción en cualquier versión de
Safari, es la técnica clásica (pre-`dvh`) para este problema.

- **`src/hooks/useViewportHeightFix.ts`** (nuevo, web-only): al montar, y en cada
  `resize`/`orientationchange`, escribe `document.documentElement.style.setProperty
  ('--app-height', window.innerHeight + 'px')`.
- Conectado en `src/app/_layout.tsx` junto a `useAutoUpdate()`.
- **`src/app/+html.tsx`**: la regla CSS pasó de `height: 100dvh` a
  `height: var(--app-height, 100dvh)` (con `100dvh` como respaldo mientras ese JS
  no ha corrido, y `100%` de `#expo-reset` como último respaldo si ni siquiera
  `dvh` es válido).

Verificado con `tsc --noEmit`, `jest` (24 tests), y con Playwright confirmando que
`getComputedStyle(document.documentElement).getPropertyValue('--app-height')` y
`#root`'s altura renderizada coinciden exactamente con `window.innerHeight` (844px
en el viewport de prueba). **Como con los intentos anteriores, no se puede confirmar
al 100% sin que el usuario lo vea en su iPhone real** — pero a diferencia de los
fixes anteriores (que dependían de que la librería de safe-area o el navegador
interpretaran algo correctamente), este no depende de ningún soporte de features CSS
modernas ni de medición de insets — solo de `window.innerHeight`, que existe desde
los primeros navegadores móviles.

### 2026-08-15 — Diagnóstico correcto por fin: `window.innerHeight` ≠ espacio visible real en Safari

Se agregó temporalmente un indicador de versión visible en el pie de Configuración
(`Versión: {APP_VERSION}`) para descartar de una vez la sospecha de que el iPhone del
usuario estuviera cargando una copia cacheada vieja en cada prueba. El usuario lo
confirmó: el texto coincidía exactamente con el `version.json` del último deploy —
**la caché nunca fue el problema**, cada fix sí se estaba probando de verdad.

La pista definitiva vino de un comentario del usuario: "no se ve porque lo tapa la
barra inferior de Safari". Eso identificó el error real en los tres intentos
anteriores (`100dvh`, tope de insets, incluso `window.innerHeight`): todos usan el
**layout viewport** de Safari (una altura estable que asume que el chrome del
navegador — la barra de herramientas inferior — está oculto), no el **visual
viewport** (el área realmente visible en cada momento). Cuando la barra de Safari
está en pantalla ocupando espacio real, `window.innerHeight` sigue reportando la
altura "grande" como si no estuviera — nuestra página se dibuja más alta de lo que
realmente se puede ver, y esa porción de más queda geométricamente detrás de la
barra de Safari (por eso "la tapa"; en una captura de pantalla se ve como espacio en
blanco de más).

**Fix**: `useViewportHeightFix.ts` ahora usa `window.visualViewport.height` como
fuente principal (con `window.innerHeight` como respaldo si no está disponible) —
es la API que Apple documenta específicamente para este problema, soportada desde
iOS 13, y se actualiza en tiempo real vía sus propios eventos `resize`/`scroll`
cuando el chrome de Safari aparece o desaparece.

**Verificado en tiempo real con Playwright** (sin esperar a que el usuario probara
de nuevo, a pedido explícito): se cargó la app a 844px de alto, se redujo el
viewport a 760px (simulando 84px reservados por una barra de herramientas) y se
confirmó que `--app-height`, la altura real de `#root` y la posición de la tab bar
se ajustan exactamente al nuevo valor en los tres casos (844 → 760 → 844), sin
ningún sobrante — con capturas de pantalla confirmando que la tab bar queda al ras
del borde en el estado reducido, sin hueco. Esto no reproduce el chrome visual de
Safari en sí (Playwright/Chromium no lo tiene), pero sí valida que el mecanismo de
tamaño responde correctamente a cualquier altura de viewport que el navegador
reporte — que es exactamente la variable que estaba mal antes.

Verificado también con `tsc --noEmit` y `jest` (24 tests). Nota honesta: si el
usuario está viendo la PWA como pestaña normal de Safari (no como ícono instalado en
modo standalone), Safari **siempre** reserva algo de espacio para su propia barra de
herramientas — eso es normal en cualquier sitio web y no es un bug; lo que este fix
elimina es el espacio de más que nuestra página agregaba encima de eso por leer mal
el viewport.

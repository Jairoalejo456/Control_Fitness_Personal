# Guía de trabajo para programar apps con IA

> Pégalo o súbelo al inicio de cualquier chat donde estés desarrollando una app.
> Define **cómo debe comportarse la IA** y el **flujo de trabajo** para que todo
> salga ordenado, sin romper nada y sin que el asistente pierda el hilo.

---

## 1. Cómo te debes comportar (reglas base)

- **Plan antes que código.** Antes de implementar algo mediano o grande, explica
  en breve el plan y confírmalo conmigo. Para cambios pequeños y obvios, hazlo y
  avísame qué hiciste.
- **Nada de suposiciones.** Si algo no está claro, **pregunta o avisa** — no
  inventes requisitos ni decisiones. Cuando haya una opción sensata por defecto,
  tómala, pero **dímelo**.
- **Decisiones que ahorran esfuerzo/tokens.** Prefiere el camino más simple que
  cumpla; no sobre-construyas.
- **Dame opciones cuando la decisión es mía** (estilo, alcance, prioridades):
  preséntalas cortas, con pros/contras y una recomendación.
- **Sé honesto con el esfuerzo y el estado.** Di qué está hecho, qué falta, qué
  es fácil y qué es pesado. Si algo falla, dilo con el error, no lo maquilles.
- **Consejos siempre.** Si ves una mejor forma de hacer algo, propónla.
- **No recargar la app.** Si una función empieza a llenar/enredar la vista,
  repiénsala o aplázala. Completa pero que **no agobie**.

---

## 2. Flujo de trabajo (cada cambio)

1. **Implementar** el cambio.
2. **Compilar** (`build`) y **correr los tests** — deben quedar **en verde**
   antes de subir. Si el proyecto no tiene tests, al menos build limpio.
3. **Commit** con mensaje claro (qué y por qué), y **push**.
4. Si es una PWA/app con caché: **subir la versión del service worker / caché**
   en cada deploy (ver §6).
5. Reportar en una línea qué quedó y cómo probarlo.

> Regla de oro: **nunca subo algo con el build roto o tests en rojo.**

---

## 3. Diseño y mockups (antes de construir UI)

- Para decisiones visuales o pantallas nuevas, **primero un mockup** (HTML
  visualizable) para revisarlo, **no** código directo.
- Cuando exploremos una dirección, dame **3–4 variantes** distintas de verdad
  (no la misma con cambios mínimos), lado a lado, para comparar.
- Diséñalas con el **tamaño/marco real** del dispositivo objetivo (ej. móvil) y
  con **contenido real**, no “lorem ipsum”.
- La prueba final de una app real es **en el dispositivo/entorno real**, no solo
  en tests. Pídeme que verifique ahí antes de dar algo por cerrado.
- Respeta el **sistema de diseño** del proyecto (tokens de color, tipografía,
  medidas, radios). Si existe una **fuente de verdad** del estilo, síguela al pie
  de la letra; no metas valores sueltos fuera del sistema.

---

## 4. Documentación viva (memoria del proyecto)

- Mantén un **archivo de memoria** del proyecto (tipo `CONTEXT.md` / `CLAUDE.md`)
  con: qué es la app, tecnología, arquitectura, hoja de ruta y cómo se publica.
  **Un chat nuevo debe leerlo primero** para retomar sin re-explicar.
- Para features en construcción o experimentos, lleva un **doc por feature** con:
  objetivo, dónde vive (archivos), estado actual, decisiones y una **bitácora de
  cambios**. Así el trabajo **sobrevive a que se agote la ventana de contexto**.
- Actualiza esos docs **en cada ajuste**, no al final.

---

## 5. Base de datos / backend (si aplica)

- Antes de tocar el esquema, **entiende la estructura actual** (lista de tablas /
  columnas).
- Los cambios de esquema deben ser **idempotentes** (`add column if not exists`,
  `create ... if not exists`, `drop policy if exists` antes de crear, etc.), para
  poder correrlos varias veces sin romper.
- Si yo debo correr SQL manualmente, **dámelo listo para copiar** y **avísame que
  el guardado puede fallar hasta correrlo**. Ofrece la vía por consola y la vía
  por panel web.
- Escribe el **código compatible**: que lea bien aunque la columna aún no exista,
  y explícame el orden correcto (correr SQL → luego usar la función).
- Seguridad: cada usuario ve/gestiona **solo lo suyo** (RLS / filtros por
  usuario). Nada de exponer datos de terceros.
- Archivos/adjuntos: guárdalos en **almacenamiento de objetos** (no en la tabla);
  en la tabla van **solo metadatos**. Enlaces de descarga/preview **temporales
  y firmados**.

---

## 6. PWA / caché (si aplica)

- **Sube la versión de la caché** (service worker) en **cada** deploy, para que
  el dispositivo cargue lo nuevo y no una versión vieja.
- Si algo **“sigue igual”** tras un cambio, **el primer sospechoso es la caché**:
  pídeme **cerrar la app por completo** (no solo mandarla atrás) y reabrir, o
  hacer recarga forzada. No asumas que el código está mal antes de descartar esto.

---

## 7. Diagnóstico (arreglar la causa, no el síntoma)

- Cuando algo se ve mal, **busca la causa raíz** y explícamela, no parches a ciegas.
- Patrones típicos que debes revisar:
  - **Guerra de especificidad en CSS:** una regla global puede estar ganándole a
    tu regla nueva. Ajusta especificidad/orden en vez de duplicar estilos.
  - **`position: fixed` que no cubre la pantalla:** casi siempre es un ancestro
    con `transform`/`filter`/`will-change` que lo “atrapa”. Solución: renderizar
    con **portal** fuera de ese contenedor.
  - **Tokens/variables que no resuelven** al mover algo de contenedor (variables
    definidas en un scope que ya no aplica).
  - **Quirks de móvil/iOS:** el teclado que tapa animaciones (retrasa el foco);
    apertura de archivos/pestañas tras `await` (abre la ventana **dentro del
    gesto** y luego redirige); ciertos formatos que el navegador no renderiza
    solo (usa librería).
- Prefiere **auto-hospedar** dependencias pesadas (workers, librerías) en vez de
  CDN, para que funcione offline y sin depender de red externa.
- Carga **librerías pesadas del lado del cliente de forma diferida** (import
  dinámico) para no inflar el arranque ni romper el render en servidor.

---

## 8. Experimentos aislados

- Cuando probemos algo experimental (una animación, un estilo nuevo), **aíslalo**
  en su **propia clase/archivo**, sin pelear con lo existente, para que:
  1. Los cambios no dañen lo demás.
  2. Se pueda **revertir limpio** si no gusta.
  3. Se pueda **replicar** después en otras partes copiando de una fuente
     confiable, no de memoria.
- Déjalo **documentado** (ver §4) con su especificación y bitácora, aunque luego
  se revierta (para no repetir intentos fallidos).

---

## 9. Git

- Trabaja en la **rama** acordada; no subas a otra sin permiso.
- **Commits pequeños y enfocados**, mensaje claro (qué cambió y por qué).
- **Push** solo después de build verde + tests en verde.
- Si algo falla en red al subir, reintenta con esperas crecientes.
- No crees Pull Request salvo que lo pida explícitamente.

---

## 10. Comunicación

- Respóndeme en **mi idioma** y de forma **clara y directa**.
- Resúmeme cada entrega en pocas líneas: **qué cambió**, **cómo probarlo**, y si
  hay algún **paso manual** (SQL, cerrar la app, etc.).
- Termina ofreciendo el **siguiente paso** o preguntando por la decisión que sigue.

---

### Resumen en una frase
**Planea → confírmame → mockup si es visual → implementa aislado y con tokens →
build+tests verde → documenta → commit/push → dime cómo probar (y si hay paso
manual). Ante dudas, pregunta; ante “sigue igual”, sospecha de la caché; arregla
la causa, no el síntoma; y no recargues la app.**

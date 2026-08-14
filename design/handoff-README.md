# Handoff: Aplicación de control fitness personal

## Overview
App móvil (iOS-first) de seguimiento de un plan de recomposición corporal de 16 semanas: registro diario (peso, cintura, pasos, sueño, calorías, proteína, cardio, energía, notas), entrenamiento de fuerza con series/reps/RIR/peso por ejercicio, rutina de referencia por día, panel de resumen semanal con cumplimiento, y configuración de metas/datos personales. Basada en un documento/hoja de cálculo de control fitness personal (16 semanas, rutina oficial de recomposición corporal) proporcionado por el usuario.

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** (un prototipo funcional construido como Design Component sobre un runtime propio) — muestran el look-and-feel y el comportamiento previstos, no código de producción para copiar tal cual. La tarea es **recrear este diseño en el entorno de código del proyecto destino** (React Native, SwiftUI, Flutter, etc., según lo que se elija) usando sus propios patrones y librerías establecidas.

## Fidelity
**Alta fidelidad (hifi)**: colores, tipografía, espaciados e interacciones están definidos y deben respetarse con precisión. El desarrollador debe recrear la UI fielmente usando las librerías/patrones del código base elegido.

## Design System — Nocturne
Interfaz oscura, compacta y silenciosa.
- **Colores**: fondo `#161826` (ground), tarjetas `#232532`, texto principal `#e9e9ed`, texto secundario `rgba(233,233,237,0.55–0.7)`, bordes sutiles `rgba(233,233,237,0.16)`, acento único `#9184d9` (usado como línea/glow, nunca como relleno grande), estado de advertencia `#c98a8a` (rojo apagado, "Datos insuficientes"/eliminar), neutro `#75798c` (tabs inactivos, estados sin datos).
- **Tipografía**: Inter (400/500/600/700) para todo — encabezados y cuerpo. Tamaños: título de pantalla 24px/500, kicker 10px uppercase letter-spacing 0.08–0.1em color acento, cuerpo 13–14px, labels 11–12px, valores destacados 16–20px/500.
- **Radios**: 8px en tarjetas y botones grandes, 6px en inputs/botones pequeños, full-round en switches y el círculo de check de "sesión completada".
- **Botones**: outline (borde 1px acento sobre transparente), nunca rellenos sólidos, salvo el switch tipo iOS (relleno de acento cuando está activo).
- **Densidad**: compacta — gap 8–14px entre bloques, padding interno de tarjetas 12–16px.
- **Interacciones**: feedback de presión con `transform: scale(0.82–0.85)` y transición 0.08s ease-out (instantáneo); transiciones de pantalla con fade + translateY 8–10px, 0.38–0.42s cubic-bezier(0.22,1,0.36,1); barras de progreso animan `width` en 0.4s.

## Screens / Views
Todas las capturas están en `screenshots/`.

### 0. Onboarding (`00-onboarding.png`)
**Cuándo aparece**: solo la primera vez que se abre la app (sin datos guardados localmente).
**Propósito**: capturar los datos personales y metas iniciales antes de usar la app.
**Layout**: columna vertical con padding-top 56px (deja espacio para notch), scroll vertical, gap 14px entre tarjetas.
**Contenido, de arriba a abajo**:
- Kicker "Bienvenido" + título "Configura tu plan" + subtítulo aclaratorio.
- Tarjeta "Datos personales": Edad (input numérico), Sexo (segmented Hombre/Mujer), Estatura (stepper −/+ en pasos de 0.01 m).
- Tarjeta "Punto de partida": Peso inicial (stepper 0.5 kg), Cintura inicial (stepper 0.5 cm), Inicio del plan (date picker nativo), Duración en semanas (input numérico).
- Tarjeta "Metas nutricionales y sueño": Calorías objetivo (input numérico), Proteína mínima/ideal (dos inputs numéricos), Sueño ideal (stepper 0.5 h).
- Botón "Comenzar" (outline acento, ancho completo, min-height 44px) — guarda todo y marca `onboardingDone = true`.

### 1. Hoy — Registro diario (`01-hoy.png`)
**Propósito**: registrar las métricas del día actual.
**Header**: kicker "Semana 1 · {Día}", título "Registro diario", subtítulo con fecha y plan del día (ej. "17 ago 2026 · Plan: Superior A").
**Contenido** (tarjetas `#232532`, radio 8px, gap 12px):
- Peso corporal — stepper −/+ (paso 0.05 kg), valor sin registrar muestra "Sin registrar".
- Cintura — stepper −/+ (paso 0.5 cm).
- Pasos — input numérico centrado + stepper (paso 500) + barra de progreso morada animada hacia la meta semanal (4000/5000/6000/7000 según semana).
- Sueño — stepper −/+ (paso 0.5 h), objetivo mostrado al lado.
- Calorías — input numérico ancho completo + texto "Objetivo X kcal · +/- delta".
- Proteína — stepper −/+ (paso 10 g).
- Fila de 2 columnas: Cardio (stepper 5 min) y Energía (stepper 1, escala 1–10).
- Notas — textarea libre.
- Tag de estado "Fuerza: N/M series" o "completada" (outline, color acento si completo, neutro si no).
- Botón "Marcar día como registrado" (outline acento, ancho completo).
**Regla de datos**: todo campo no tocado por el usuario se guarda como `null` (nunca 0) y se muestra como "Sin registrar" — los promedios del Panel ignoran los `null`.

### 2. Entrenamiento (`02-entrenamiento.png`, variante activada en `02b-entrenamiento-variante.png`)
**Propósito**: ejecutar la rutina de fuerza/cardio/descanso del día.
**Header**: kicker "Semana 1 · {Día}", título "Entrenamiento", subtítulo con el nombre del plan.
**Día de fuerza** (Lunes/Martes/Jueves/Viernes):
- Tarjeta "Calentamiento": "Caminadora 5 minutos sin fatiga." (fija, antes de cualquier ejercicio).
- Tarjeta "Progreso de la sesión": label + "{done}/{total} series completadas" + barra de progreso.
- Una tarjeta por ejercicio, con:
  - Kicker "Ejercicio N" + nombre + rango de reps recomendado (ej. "6–10 reps").
  - A la derecha del nombre, columna de ancho fijo 78px: label "Añadir Variante" arriba + switch tipo iOS (30×17px) debajo, alineado con el nombre del ejercicio.
  - Si el switch está activo: input de texto libre "Banda / variante / agarre" (ej. "Banda 25 kg, agarre neutro").
  - Nota técnica (opcional, controlada por prop `showTechnique`).
  - Por cada serie: fila deslizable (swipe-to-delete) con input "kg" (56px), input "reps" (flex), input "RIR" (56px) y botón check ✓ (36×36px, se rellena de acento al completarse). Los inputs muestran como *placeholder* (fondo, no editable) el peso/reps de la sesión anterior de ese mismo ejercicio.
  - Botón "+ agregar serie" (outline punteado acento) debajo de las series.
- Al completar el 100% de las series de la sesión, la app navega automáticamente a la pantalla de "Sesión completada" (ver más abajo).
**Día de cardio** (Miércoles/Sábado): tarjeta con descripción de la sesión + stepper de minutos realizados.
**Día de descanso** (Domingo): tarjeta centrada con mensaje de descanso.

### 3. Sesión completada (`03-sesion-completa.png`)
**Cuándo aparece**: automáticamente al marcar la última serie pendiente de la rutina de fuerza del día.
**Layout**: pantalla completa sin header ni tab bar, contenido centrado vertical y horizontalmente.
**Contenido**: círculo outline acento 76px con check SVG, título "Rutina completada" (22px/500), subtítulo "{Plan} · {N} ejercicios · {N} series", botón "Continuar" (outline acento) que regresa a la navegación normal.

### 4. Rutina — referencia (`04-rutina.png`)
**Propósito**: consultar la rutina completa de cualquier día sin registrar nada.
**Header**: kicker "Referencia", título "Rutina oficial", subtítulo "Recomposición corporal · 16 semanas".
**Contenido**:
- Fila de tabs horizontales scrolleables, una por día de la semana (Lun–Dom), outline acento en el día seleccionado.
- Nombre del plan del día seleccionado.
- Si es día de fuerza: tarjeta de calentamiento + una tarjeta por ejercicio (nombre, series recomendadas, rango de reps, descanso, nota técnica, switch de variante igual que en Entrenamiento pero sin inputs de registro).
- Si es cardio: tarjeta con la descripción de la sesión.
- Si es descanso: tarjeta informativa.
- Tarjeta final "Progresiones": notas fijas sobre progresión de dominadas y flexiones.

### 5. Panel — resumen semanal (`05-panel.png`)
**Propósito**: ver cumplimiento y promedios de la semana en curso, y el histórico de 16 semanas.
**Header**: kicker "Panel", título "Resumen semanal", subtítulo "Semana 1 de {duración}".
**Contenido**:
- Grid 2×3 de tarjetas (peso, cintura, pasos, sueño, calorías, proteína), cada una mostrando: valor promedio (o "—"/"Sin registrar"), conteo de registros ("n/7 registros" o "n/3 mediciones" para cintura), y etiqueta de confianza ("Promedio provisional" con 1–2 registros, "Promedio semanal" con 3+, "Sin datos" con 0). Pasos/calorías/proteína muestran también su % de cumplimiento frente a la meta.
- Fila de 2 tarjetas: "Fuerza" ({sesiones completadas}/{sesiones programadas}) y "Cardio semanal" (minutos totales).
- Tarjeta "Cumplimiento general": combina pasos+sueño+calorías+proteína+fuerza; si el registro semanal es <80% o no hay datos, muestra "Datos insuficientes"/"Sin datos" en vez de un % engañoso.
- Tarjeta "Recomendación semanal": texto generado según reglas (ver Lógica de negocio).
- Lista de 16 semanas + fila "Base": cada fila muestra semana, fecha de inicio, peso, cintura, cumplimiento y una etiqueta de estado ("Aún no inicia", "Programada", "En progreso", "Datos insuficientes", o "{X}% cumplimiento").

### 6. Configuración (`06-config.png`)
**Propósito**: editar datos personales, punto de partida y metas en cualquier momento.
**Header**: kicker "Configuración", título "Datos del plan", subtítulo "Inicio: {fecha}".
**Contenido**: mismas tarjetas que el onboarding (Datos personales, Punto de partida — incluye fecha editable con date picker nativo y nota sobre la cintura inicial medida después de comer —, Metas nutricionales, Sueño) más una tarjeta final **"Administrar ejercicios"** (fila clicable con chevron "›") que navega a la pantalla de administración.

### 7. Administrar ejercicios — fuerza (`07-administrar-ejercicios.png`) y cardio (`07b-administrar-cardio.png`)
**Propósito**: editar la rutina base (nombres, rango de reps, orden; y para días de cardio, la descripción de la sesión).
**Header**: enlace "← Configuración" para volver (también soporta swipe-back desde el borde izquierdo, gesto nativo iOS), título "Administrar ejercicios", subtítulo "Nombres, series recomendadas y orden".
**Contenido**:
- Tabs horizontales por cada día con actividad (Lun/Mar/Mié/Jue/Vie/Sáb — se excluye el día de descanso).
- Días de fuerza: una tarjeta por ejercicio con asa de arrastre "⠿" (drag-to-reorder, reemplaza los antiguos botones ↑/↓), input de nombre, e inputs de reps mín./máx. + unidad (solo lectura).
- Días de cardio: una tarjeta con textarea de descripción de la sesión.
- Los cambios aquí persisten y se reflejan en Entrenamiento y Rutina.

## Interactions & Behavior
- **Navegación**: tab bar inferior fija de 5 iconos (Hoy/Entreno/Rutina/Panel/Config), iconografía en SVG lineal 22×22, color acento cuando activo.
- **Transiciones de pantalla**: fade + translateY, 0.38–0.42s, `cubic-bezier(0.22,1,0.36,1)`, en cada cambio de tab y al entrar a pantallas secundarias.
- **Swipe-to-delete** en filas de series: arrastre horizontal (pointer events), revela fondo rojo "Eliminar", se borra al soltar pasado 60px de desplazamiento; si no, vuelve a su posición (spring-like, 0.32s).
- **Swipe-back** en "Administrar ejercicios": arrastre desde los primeros 32px del borde izquierdo; al superar 90px de desplazamiento, cierra la pantalla; si no, rebota a su posición.
- **Drag-to-reorder** de ejercicios: asa "⠿", arrastre vertical, reordena cada ~90px de desplazamiento.
- **Botones +/-**: feedback de presión `scale(0.82–0.85)`, transición 0.08s ease-out (percibido como instantáneo).
- **Auto-navegación**: al completar el 100% de las series de la sesión de fuerza del día, se muestra automáticamente la pantalla "Sesión completada".
- **Persistencia**: toda la data (registros diarios por fecha, sets/variantes por ejercicio, configuración, rutina personalizada, flag de onboarding) se guarda en `localStorage` bajo una sola clave y se restaura al recargar.

## State Management
- `dailyLogs`: mapa `fecha ISO → {peso, cintura, pasos, sueno, calorias, proteina, cardioMin, energia, notas, dayLogged}` — todos los campos nullable.
- `exerciseSessions`: mapa `fecha__plan__ejercicioId → [{peso, reps, rir, done}]` — datos de la sesión de ese día concreto.
- `exerciseDefaults`: mapa `plan__ejercicioId → {pesoBySet[], repsBySet[], setCount}` — "memoria" que alimenta los placeholders de kg/reps y el número de series por defecto en la próxima sesión.
- `customRoutine`: mapa `plan → [{id, name, repMin, repMax, unit, sets, rest, tecnica}]` — editable desde "Administrar ejercicios", con orden persistido.
- `customCardioDesc`: mapa `plan cardio → descripción editable`.
- Config: edad, sexo, estatura, peso/cintura inicial, fecha de inicio del plan, duración en semanas, calorías objetivo, tolerancia, proteína mínima/ideal, sueño mínimo/ideal.
- `onboardingDone`: booleano — controla si se muestra la pantalla 0.
- Metas de pasos por semana: 4000 (semana 1), 5000 (semana 2), 6000 (semana 3), 7000 (semana 4 en adelante).

## Lógica de negocio (cumplimiento y recomendaciones)
- **Nunca usar `valor || 0`** para promedios: un campo sin registrar es `null`/ausente y se excluye del cálculo, no cuenta como cero.
- Promedios de peso/cintura muestran cuántos registros los componen (ej. "1/7 registros", "n/3 mediciones" para cintura) y una etiqueta de confianza: 0 → "Sin datos"; 1–2 (peso) o 1 (cintura) → "Promedio provisional"; 3+ → "Promedio semanal".
- Cumplimiento de pasos/sueño/calorías/proteína = (días que alcanzaron la meta) / (días con ese dato registrado esa semana) — nunca se divide por 7 si aún no hay 7 registros.
- Cumplimiento de fuerza = sesiones de fuerza completadas al 100% / sesiones de fuerza programadas esa semana.
- Cumplimiento general = promedio de los cumplimientos anteriores que sí tengan datos; si el % de días con algún registro esa semana es menor al 80%, se muestra "Datos insuficientes" en vez de un porcentaje.
- Estados de semana en el histórico: **Aún no inicia** (hoy < fecha de inicio del plan) · **Programada** (semana futura) · **En progreso** (semana actual) · **Datos insuficientes** (semana terminada con <4/7 días con datos) · **{X}% cumplimiento** (semana terminada con datos suficientes).
- Recomendación semanal: "Necesitamos más datos" si no hay ningún registro; "Mejora la constancia" si el registro semanal es <80%; en la primera semana nunca se recomiendan cambios de objetivos (calorías, etc.), solo continuidad.
- El calentamiento fijo ("Caminadora 5 min sin fatiga") en los 4 días de fuerza **no** cuenta para el total de minutos de cardio de la semana.

## Design Tokens
```
--color-bg: #161826
--color-surface: #232532
--color-text: #e9e9ed
--color-text-secondary: rgba(233,233,237,0.55–0.75)
--color-border: rgba(233,233,237,0.16)
--color-accent: #9184d9
--color-warning: #c98a8a
--color-neutral: #75798c
--radius-lg: 8px
--radius-sm: 6px
--font-family: 'Inter', system-ui, sans-serif
--transition-press: transform 0.08s ease-out
--transition-screen: 0.38–0.42s cubic-bezier(0.22,1,0.36,1)
--transition-drag: transform 0.32s cubic-bezier(0.22,1,0.36,1)
```
El sistema de diseño completo (Nocturne) — ramas de color 100–900, tipografía, espaciado, sombras — vive en `_ds/nocturne-.../styles.css` y `readme.md` dentro del proyecto de diseño original; este prototipo tomó sus valores base pero se construyó con estilos inline (limitación del entorno de prototipado), así que los valores exactos están documentados arriba.

## Assets
- Sin imágenes ni iconos externos: toda la iconografía de la tab bar y el check de sesión completada son SVG lineales dibujados a mano (stroke, sin relleno).
- Fuente: Google Fonts "Inter" (400/500/600/700), cargada vía `@import`.

## Data Source
El plan de ejercicios, metas y calendario provienen de la hoja de cálculo original del usuario ("Control automático · recomposición corporal", 16 semanas): rutina de fuerza en 4 días (Superior A/B, Inferior A/B) con 6–8 ejercicios cada uno, 2 días de cardio (Miércoles obligatorio, Sábado opcional), 1 día de descanso (Domingo), metas de pasos progresivas por semana, calorías/proteína/sueño objetivo configurables. El archivo completo de datos extraídos está en `data-reference.md` en este mismo paquete.

## Files
- `Fitness Tracker.dc.html` — el prototipo funcional completo (referencia de diseño, no producción).
- `screenshots/` — una captura de cada pantalla y variante de estado listada arriba.
- `data-reference.md` — datos de la rutina de 16 semanas extraídos del Excel original del usuario.

# Control Fitness Personal

App móvil (iOS-first) para seguir un plan de recomposición corporal de 16 semanas: registro
diario (peso, cintura, pasos, sueño, calorías, proteína, cardio, energía, notas), entrenamiento
de fuerza con series/reps/RIR, rutina de referencia, panel de resumen semanal con cumplimiento y
recomendaciones, y configuración/administración de ejercicios.

Construida con **React Native + Expo** (managed workflow). Todos los datos se guardan
localmente en el dispositivo — no hay backend ni cuenta de usuario.

## Cómo correrla

```bash
npm install
npm start
```

Escanea el código QR con la app **Expo Go** (gratis, App Store) desde tu iPhone para probarla
en tu propio equipo con gestos nativos (deslizar para borrar series, arrastrar para reordenar
ejercicios, selector de fecha nativo, hoja para compartir el respaldo).

`npm run web` levanta una vista previa en el navegador — útil para revisar layout y lógica
rápidamente, pero los gestos nativos y el selector de fecha no funcionan igual ahí.

## Otros comandos

```bash
npm test           # tests de la lógica de negocio (promedios, cumplimiento, recomendaciones)
npm run typecheck  # chequeo de tipos con TypeScript
npm run lint       # eslint
```

## Estructura

```
src/
  app/            Pantallas y navegación (Expo Router)
  theme/          Tokens de diseño (colores, tipografía, espaciado, animación)
  types/          Modelo de datos
  data/           Datos semilla: rutina oficial de 16 semanas, metas de pasos, config por defecto
  logic/          Lógica de negocio pura (promedios, cumplimiento, recomendaciones) + tests
  store/          Estado global (Zustand + persistencia local)
  services/       Exportar/importar respaldo (JSON)
  hooks/          Hooks que combinan estado + lógica para las pantallas
  components/     Componentes de UI reutilizables y específicos de cada pantalla
```

// Design tokens — sistema "Nocturne" (ver design_handoff_fitness_tracker/README.md)
// Interfaz oscura, compacta y silenciosa.

export const colors = {
  background: '#161826',
  card: '#232532',
  textPrimary: '#e9e9ed',
  textSecondary: 'rgba(233,233,237,0.7)',
  textSecondaryMuted: 'rgba(233,233,237,0.55)',
  border: 'rgba(233,233,237,0.16)',
  accent: '#9184d9',
  accentTranslucent: 'rgba(145,132,217,0.14)',
  warning: '#c98a8a',
  warningTranslucent: 'rgba(201,138,138,0.14)',
  // Semáforo sutil de cumplimiento — mismo nivel de desaturación que accent/warning,
  // para que se sienta parte del sistema "Nocturne" y no un color de librería genérico.
  good: '#7fae8c',
  goodTranslucent: 'rgba(127,174,140,0.14)',
  caution: '#c9a26a',
  cautionTranslucent: 'rgba(201,162,106,0.14)',
  neutral: '#75798c',
  black: '#000000',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  screenTitle: { fontSize: 24, fontFamily: fonts.medium, color: colors.textPrimary },
  kicker: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: colors.accent,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  subtitle: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSecondary },
  body: { fontSize: 14, fontFamily: fonts.regular, color: colors.textPrimary },
  bodySecondary: { fontSize: 13, fontFamily: fonts.regular, color: colors.textSecondary },
  label: { fontSize: 12, fontFamily: fonts.medium, color: colors.textSecondary },
  labelSmall: { fontSize: 11, fontFamily: fonts.medium, color: colors.textSecondary },
  valueLarge: { fontSize: 18, fontFamily: fonts.medium, color: colors.textPrimary },
  valueXLarge: { fontSize: 20, fontFamily: fonts.medium, color: colors.textPrimary },
  buttonLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.accent },
} as const;

export const radii = {
  card: 8,
  buttonLg: 8,
  buttonSm: 6,
  full: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 24,
} as const;

export const motion = {
  pressScale: 0.83,
  pressDuration: 80,
  screenTransitionDuration: 400,
  progressBarDuration: 400,
  dragSpringDuration: 320,
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.xl,
  screenPaddingTop: 56,
  cardPadding: spacing.md,
  cardGap: spacing.md,
  tabBarIconSize: 22,
} as const;

/** Semáforo sutil de cumplimiento: ≥80% bien, 50–79% atención, resto neutro (no rojo — esto no es un error, es un hábito personal). */
export function getComplianceColor(pct: number | null): string {
  if (pct === null) return colors.textPrimary;
  if (pct >= 0.8) return colors.good;
  if (pct >= 0.5) return colors.caution;
  return colors.textPrimary;
}

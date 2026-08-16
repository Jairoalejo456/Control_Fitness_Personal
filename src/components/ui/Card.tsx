import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, radii, spacing, typography } from '@/theme/tokens';

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardKicker({ children, icon: Icon }: { children: string; icon?: LucideIcon }) {
  if (!Icon) return <Text style={styles.kicker}>{children}</Text>;
  return (
    <View style={styles.kickerRow}>
      <Icon size={13} strokeWidth={2} color={colors.accent} />
      <Text style={styles.kicker}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md + 2,
    gap: spacing.md,
    // Sombra muy sutil para separar la tarjeta del fondo — casi imperceptible a
    // propósito, el sistema "Nocturne" es silencioso, no busca relieve marcado.
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  kicker: { ...typography.kicker },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors, typography } from '@/theme/tokens';

type Props = PropsWithChildren<{ label: string; icon?: LucideIcon }>;

export function FieldRow({ label, icon: Icon, children }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        {Icon ? <Icon size={15} strokeWidth={1.75} color={colors.textSecondary} /> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  label: { ...typography.body, flexShrink: 1 },
});

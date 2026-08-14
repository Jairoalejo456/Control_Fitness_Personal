import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@/theme/tokens';

type Props = PropsWithChildren<{ label: string }>;

export function FieldRow({ label, children }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { ...typography.body, flexShrink: 1 },
});

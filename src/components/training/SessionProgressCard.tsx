import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, typography } from '@/theme/tokens';

type Props = { done: number; total: number };

export function SessionProgressCard({ done, total }: Props) {
  const progress = total > 0 ? done / total : 0;
  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.label}>Progreso de la sesión</Text>
        <Text style={styles.value}>
          {done}/{total} series completadas
        </Text>
      </View>
      <ProgressBar progress={progress} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...typography.body },
  value: { ...typography.body, color: colors.accent },
});

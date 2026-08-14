import { StyleSheet, Text } from 'react-native';

import type { MetricAverage } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { colors, typography } from '@/theme/tokens';

const CONFIDENCE_LABEL: Record<MetricAverage['confidence'], string> = {
  'sin-datos': 'Sin datos',
  provisional: 'Promedio provisional',
  semanal: 'Promedio semanal',
};

type Props = {
  label: string;
  metric: MetricAverage;
  unit: string;
  countLabel: string; // ej. "registros" o "mediciones"
  compliancePct?: number | null;
};

export function MetricGridCell({ label, metric, unit, countLabel, compliancePct }: Props) {
  return (
    <Card style={styles.cell}>
      <CardKicker>{label}</CardKicker>
      <Text style={styles.value}>{metric.average === null ? '—' : `${metric.average.toFixed(1)} ${unit}`}</Text>
      <Text style={styles.countText}>
        {metric.count}/{countLabel === 'mediciones' ? 3 : 7} {countLabel}
      </Text>
      <Text style={styles.confidence}>
        {CONFIDENCE_LABEL[metric.confidence]}
        {compliancePct !== undefined && compliancePct !== null ? ` · ${Math.round(compliancePct * 100)}% cumplimiento` : ''}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  cell: { flex: 1, gap: 4 },
  value: { ...typography.valueXLarge },
  countText: { ...typography.bodySecondary },
  confidence: { ...typography.labelSmall, color: colors.accent },
});

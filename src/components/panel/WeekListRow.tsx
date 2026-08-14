import { StyleSheet, Text, View } from 'react-native';

import type { WeekStatus } from '@/types/models';
import type { WeekMetrics } from '@/logic/weekMetrics';
import { formatDisplayDate } from '@/logic/dateUtils';
import { colors, spacing, typography } from '@/theme/tokens';

const STATUS_LABEL: Record<WeekStatus['label'], string> = {
  'aun-no-inicia': 'Aún no inicia',
  programada: 'Programada',
  'en-progreso': 'En progreso',
  'datos-insuficientes': 'Datos insuficientes',
  'sin-datos': 'Sin datos',
  cumplimiento: '',
};

type Props = {
  weekIndex: number;
  metrics: WeekMetrics;
  status: WeekStatus;
};

export function WeekListRow({ weekIndex, metrics, status }: Props) {
  const statusText = status.label === 'cumplimiento' ? `${Math.round((status.compliancePct ?? 0) * 100)}% cumplimiento` : STATUS_LABEL[status.label];

  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <Text style={styles.week}>
          Semana {weekIndex} · {formatDisplayDate(metrics.startDate)}
        </Text>
        <Text style={styles.status}>{statusText}</Text>
      </View>
      <Text style={styles.detail}>
        Peso {metrics.peso.average === null ? '—' : `${metrics.peso.average.toFixed(1)} kg`} · Cintura{' '}
        {metrics.cintura.average === null ? '—' : `${metrics.cintura.average.toFixed(1)} cm`} · Cumpl.{' '}
        {status.label === 'cumplimiento' ? `${Math.round((status.compliancePct ?? 0) * 100)}%` : '—'}
      </Text>
    </View>
  );
}

export function BaseWeekRow({ pesoInicialKg, cinturaInicialCm, startDate }: { pesoInicialKg: number; cinturaInicialCm: number; startDate: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.topLine}>
        <Text style={styles.week}>Semana Base · {formatDisplayDate(startDate)}</Text>
        <Text style={styles.status}>Referencia</Text>
      </View>
      <Text style={styles.detail}>
        Peso {pesoInicialKg.toFixed(1)} kg · Cintura {cinturaInicialCm.toFixed(1)} cm
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  topLine: { flexDirection: 'row', justifyContent: 'space-between' },
  week: { ...typography.body },
  status: { ...typography.bodySecondary, color: colors.textSecondary },
  detail: { ...typography.bodySecondary },
});

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { DetailsToggle } from '@/components/ui/DetailsToggle';
import { MetricGridCell } from '@/components/panel/MetricGridCell';
import { WeekListRow, BaseWeekRow } from '@/components/panel/WeekListRow';
import { TrendChart } from '@/components/panel/TrendChart';
import { useAppStore } from '@/store/appStore';
import { usePanelData } from '@/hooks/usePanelData';
import { colors, getComplianceColor, spacing, typography } from '@/theme/tokens';

export default function PanelScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const config = useAppStore((s) => s.config);
  const { currentWeekIndex, currentWeekMetrics, recommendation, weeksHistory, weightTrend, waistTrend } = usePanelData();

  const m = currentWeekMetrics;
  const overallPct = m.overallCompliance.kind === 'datos-insuficientes' ? null : m.overallCompliance.pct;
  const overallText = overallPct === null ? 'Datos insuficientes' : `${Math.round(overallPct * 100)}%`;

  return (
    <Screen>
      <ScreenTitle kicker="Panel" title="Resumen semanal" subtitle={`Semana ${currentWeekIndex} de ${config.duracionSemanas}`} />

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Cumplimiento general</Text>
          <Text style={[styles.bigValue, { color: getComplianceColor(overallPct) }]}>{overallText}</Text>
        </View>
        <Text style={typography.body}>{recommendation}</Text>
      </Card>

      <DetailsToggle expanded={showDetails} onToggle={() => setShowDetails((v) => !v)} />

      {showDetails ? (
        <>
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <MetricGridCell label="Peso" metric={m.peso} unit="kg" countLabel="registros" />
              <MetricGridCell label="Cintura" metric={m.cintura} unit="cm" countLabel="mediciones" />
            </View>
            <View style={styles.gridRow}>
              <MetricGridCell label="Pasos" metric={m.pasos} unit="pasos" countLabel="registros" compliancePct={m.pasosCompliance} />
              <MetricGridCell label="Sueño" metric={m.sueno} unit="h" countLabel="registros" />
            </View>
            <View style={styles.gridRow}>
              <MetricGridCell label="Calorías" metric={m.calorias} unit="kcal" countLabel="registros" compliancePct={m.caloriasCompliance} />
              <MetricGridCell label="Proteína" metric={m.proteina} unit="g" countLabel="registros" compliancePct={m.proteinaCompliance} />
            </View>
          </View>

          <View style={styles.twoCol}>
            <Card style={styles.halfCard}>
              <CardKicker>Fuerza</CardKicker>
              <Text style={styles.bigValue}>
                {m.strengthCompletedSessions}/{m.strengthProgrammedSessions} sesiones
              </Text>
            </Card>
            <Card style={styles.halfCard}>
              <CardKicker>Cardio semanal</CardKicker>
              <Text style={styles.bigValue}>{m.cardioMinutes > 0 ? `${m.cardioMinutes} min` : 'Sin registrar'}</Text>
            </Card>
          </View>

          <Card>
            <CardKicker>Tendencias</CardKicker>
            <TrendChart title="Peso" points={weightTrend} unit="kg" />
            <TrendChart title="Cintura" points={waistTrend} unit="cm" />
          </Card>

          <View>
            <Text style={styles.historyTitle}>{config.duracionSemanas} SEMANAS</Text>
            <BaseWeekRow pesoInicialKg={config.pesoInicialKg} cinturaInicialCm={config.cinturaInicialCm} startDate={config.fechaInicioPlan} />
            {weeksHistory.map((row) => (
              <WeekListRow key={row.weekIndex} weekIndex={row.weekIndex} metrics={row.metrics} status={row.status} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1, gap: 4 },
  bigValue: { ...typography.valueXLarge },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.body },
  historyTitle: { ...typography.kicker, color: colors.textSecondary, marginBottom: spacing.sm },
});

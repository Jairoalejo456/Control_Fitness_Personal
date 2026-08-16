import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { DetailsToggle } from '@/components/ui/DetailsToggle';
import { HtmlDateInput } from '@/components/ui/HtmlDateInput';
import { PressableScale } from '@/components/ui/PressableScale';
import { MetricGridCell } from '@/components/panel/MetricGridCell';
import { WeekListRow, BaseWeekRow } from '@/components/panel/WeekListRow';
import { TrendChart } from '@/components/panel/TrendChart';
import { useAppStore } from '@/store/appStore';
import { usePanelData } from '@/hooks/usePanelData';
import { compareDates } from '@/logic/dateComparison';
import { getPersonalRecord } from '@/logic/personalRecords';
import { formatDisplayDate, todayISO } from '@/logic/dateUtils';
import type { ISODateString, StrengthPlanId } from '@/types/models';
import { colors, getComplianceColor, spacing, typography } from '@/theme/tokens';

const PLAN_LABELS: Record<StrengthPlanId, string> = {
  superiorA: 'Superior A',
  inferiorA: 'Inferior A',
  superiorB: 'Superior B',
  inferiorB: 'Inferior B',
};

function DateChip({ label, value, onChange }: { label: string; value: ISODateString; onChange: (iso: ISODateString) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const DateTimePicker = Platform.OS !== 'web' ? require('@react-native-community/datetimepicker').default : null;

  return (
    <View style={styles.dateChip}>
      <Text style={styles.dateChipLabel}>{label}</Text>
      <PressableScale onPress={() => setShowPicker((v) => !v)} style={styles.dateChipButton}>
        <Text style={styles.dateChipValue}>{formatDisplayDate(value)}</Text>
      </PressableScale>
      {showPicker && Platform.OS === 'web' ? (
        <HtmlDateInput value={value} onChange={(iso) => { onChange(iso); setShowPicker(false); }} max={todayISO()} />
      ) : null}
      {showPicker && DateTimePicker ? (
        <DateTimePicker
          value={new Date(`${value}T12:00:00`)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          themeVariant="dark"
          accentColor={colors.accent}
          onChange={(_event: { type: string }, date?: Date) => {
            if (Platform.OS !== 'ios') setShowPicker(false);
            if (date) {
              const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              onChange(iso);
            }
          }}
        />
      ) : null}
    </View>
  );
}

export default function ProgresoScreen() {
  const config = useAppStore((s) => s.config);
  const dailyLogs = useAppStore((s) => s.dailyLogs);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);
  const customRoutine = useAppStore((s) => s.customRoutine);
  const [showDetails, setShowDetails] = useState(false);

  const [fechaA, setFechaA] = useState<ISODateString>(config.fechaInicioPlan);
  const [fechaB, setFechaB] = useState<ISODateString>(todayISO());

  const { currentWeekIndex, currentWeekMetrics, recommendation, weeksHistory, weightTrend, waistTrend } = usePanelData();

  const comparison = useMemo(() => compareDates(dailyLogs, fechaA, fechaB), [dailyLogs, fechaA, fechaB]);

  const records = useMemo(() => {
    const rows: { plan: StrengthPlanId; nombre: string; pesoKg: number; reps: number }[] = [];
    (Object.keys(customRoutine) as StrengthPlanId[]).forEach((plan) => {
      customRoutine[plan].forEach((exercise) => {
        const record = getPersonalRecord(exerciseSessions, plan, exercise.id);
        if (record) rows.push({ plan, nombre: exercise.nombre, pesoKg: record.pesoKg, reps: record.reps });
      });
    });
    return rows;
  }, [customRoutine, exerciseSessions]);

  const m = currentWeekMetrics;
  const overallPct = m.overallCompliance.kind === 'datos-insuficientes' ? null : m.overallCompliance.pct;
  const overallText = overallPct === null ? 'Datos insuficientes' : `${Math.round(overallPct * 100)}%`;

  return (
    <Screen>
      <ScreenTitle kicker="Progreso" title="Tu evolución" subtitle={`Semana ${currentWeekIndex} de ${config.duracionSemanas}`} />

      <Card>
        <CardKicker>Comparar dos fechas</CardKicker>
        <View style={styles.dateRow}>
          <DateChip label="Desde" value={fechaA} onChange={setFechaA} />
          <DateChip label="Hasta" value={fechaB} onChange={setFechaB} />
        </View>
        <View style={styles.comparisonRows}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Peso</Text>
            <Text style={styles.bigValue}>
              {comparison.pesoDeltaKg === null
                ? 'Sin datos suficientes'
                : `${comparison.pesoDeltaKg > 0 ? '+' : ''}${comparison.pesoDeltaKg} kg`}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Cintura</Text>
            <Text style={styles.bigValue}>
              {comparison.cinturaDeltaCm === null
                ? 'Sin datos suficientes'
                : `${comparison.cinturaDeltaCm > 0 ? '+' : ''}${comparison.cinturaDeltaCm} cm`}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Cardio en el período</Text>
            <Text style={styles.bigValue}>{comparison.cardioTotalMin} min</Text>
          </View>
        </View>
      </Card>

      <Card>
        <CardKicker icon={Trophy}>Récords personales</CardKicker>
        {records.length === 0 ? (
          <Text style={typography.bodySecondary}>Todavía no hay series completadas para calcular récords.</Text>
        ) : (
          records.map((r) => (
            <View key={`${r.plan}-${r.nombre}`} style={styles.recordRow}>
              <Text style={styles.recordName}>{r.nombre}</Text>
              <Text style={styles.recordValue}>
                {r.pesoKg}kg × {r.reps}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <CardKicker>Esta semana</CardKicker>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Peso promedio</Text>
          <Text style={styles.bigValue}>{m.peso.average === null ? '—' : `${m.peso.average.toFixed(1)} kg`}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Cintura promedio</Text>
          <Text style={styles.bigValue}>{m.cintura.average === null ? '—' : `${m.cintura.average.toFixed(1)} cm`}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Cardio semanal</Text>
          <Text style={styles.bigValue}>{m.cardioMinutes > 0 ? `${m.cardioMinutes} min` : 'Sin registrar'}</Text>
        </View>
      </Card>

      <DetailsToggle expanded={showDetails} onToggle={() => setShowDetails((v) => !v)} />

      {showDetails ? (
        <>
          <Card>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Cumplimiento general</Text>
              <Text style={[styles.bigValue, { color: getComplianceColor(overallPct) }]}>{overallText}</Text>
            </View>
            <Text style={typography.body}>{recommendation}</Text>
          </Card>

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
  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateChip: { flex: 1, gap: 4 },
  dateChipLabel: { ...typography.labelSmall },
  dateChipButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dateChipValue: { ...typography.body },
  comparisonRows: { gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.body },
  bigValue: { ...typography.valueLarge },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  recordName: { ...typography.body, flexShrink: 1 },
  recordValue: { ...typography.bodySecondary, color: colors.caution },
  grid: { gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  halfCard: { flex: 1, gap: 4 },
  historyTitle: { ...typography.kicker, color: colors.textSecondary, marginBottom: spacing.sm },
});

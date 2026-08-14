import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import type { TrendPoint } from '@/logic/trendSeries';
import { colors, typography } from '@/theme/tokens';

type Props = {
  title: string;
  points: TrendPoint[];
  unit: string;
  height?: number;
};

export function TrendChart({ title, points, unit, height = 100 }: Props) {
  const width = 300;
  const paddingX = 8;
  const paddingY = 12;

  if (points.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>Aún no hay suficientes semanas con datos para mostrar la tendencia.</Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const step = points.length > 1 ? usableWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = paddingX + i * step;
    const y = paddingY + usableHeight - ((p.value - min) / range) * usableHeight;
    return { x, y, value: p.value };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.range}>
          {min.toFixed(1)}–{max.toFixed(1)} {unit}
        </Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke={colors.border} strokeWidth={1} />
        <Polyline points={polylinePoints} fill="none" stroke={colors.accent} strokeWidth={1.5} />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={2.5} fill={colors.accent} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.label },
  range: { ...typography.bodySecondary },
  empty: { ...typography.bodySecondary },
});

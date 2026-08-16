import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Polyline, Stop } from 'react-native-svg';

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
  const baselineY = paddingY + usableHeight;
  const areaPoints = `${paddingX},${baselineY} ${polylinePoints} ${width - paddingX},${baselineY}`;
  const gradientId = `trend-fill-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const last = coords[coords.length - 1];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.range}>
          {min.toFixed(1)}–{max.toFixed(1)} {unit}
        </Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Line x1={paddingX} y1={baselineY} x2={width - paddingX} y2={baselineY} stroke={colors.border} strokeWidth={1} />
        <Polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <Polyline points={polylinePoints} fill="none" stroke={colors.accent} strokeWidth={1.5} />
        {coords.slice(0, -1).map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={2} fill={colors.accent} opacity={0.55} />
        ))}
        {/* Punto actual destacado con un halo, para que el último valor resalte sobre el resto de la serie. */}
        <Circle cx={last.x} cy={last.y} r={6} fill={colors.accent} opacity={0.16} />
        <Circle cx={last.x} cy={last.y} r={3.5} fill={colors.accent} />
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

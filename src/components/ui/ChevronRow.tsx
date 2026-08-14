import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  subtitle?: string;
};

export function ChevronRow({ label, onPress, subtitle }: Props) {
  return (
    <PressableScale onPress={onPress} style={styles.row}>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textGroup: { flex: 1, gap: 2 },
  label: { ...typography.body },
  subtitle: { ...typography.bodySecondary },
});

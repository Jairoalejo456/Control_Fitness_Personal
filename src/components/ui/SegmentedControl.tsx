import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Option<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radii.buttonSm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  segment: { paddingVertical: 8, paddingHorizontal: 16 },
  segmentSelected: { backgroundColor: colors.accentTranslucent },
  label: { ...typography.body, color: colors.textSecondary },
  labelSelected: { color: colors.accent, fontFamily: typography.label.fontFamily },
});

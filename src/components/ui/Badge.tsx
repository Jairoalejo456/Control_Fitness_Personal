import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, typography } from '@/theme/tokens';

type Props = {
  label: string;
  active?: boolean;
};

export function Badge({ label, active }: Props) {
  return (
    <View style={[styles.badge, active ? styles.badgeActive : styles.badgeNeutral]}>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelNeutral]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeActive: { borderColor: colors.good, backgroundColor: colors.goodTranslucent },
  badgeNeutral: { borderColor: colors.neutral },
  label: { ...typography.labelSmall },
  labelActive: { color: colors.good },
  labelNeutral: { color: colors.neutral },
});

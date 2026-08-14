import { StyleSheet, Text, View } from 'react-native';

import { colors, typography, spacing } from '@/theme/tokens';

type Props = {
  kicker: string;
  title: string;
  subtitle?: string;
};

export function ScreenTitle({ kicker, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  kicker: { ...typography.kicker },
  title: { ...typography.screenTitle, color: colors.textPrimary },
  subtitle: { ...typography.subtitle },
});

import { StyleSheet, Text } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { typography } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  expanded: boolean;
  onToggle: () => void;
  labelCollapsed?: string;
  labelExpanded?: string;
};

export function DetailsToggle({
  expanded,
  onToggle,
  labelCollapsed = 'Más detalles',
  labelExpanded = 'Ocultar detalles',
}: Props) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <PressableScale onPress={onToggle} style={styles.row} accessibilityLabel={expanded ? labelExpanded : labelCollapsed}>
      <Text style={styles.label}>{expanded ? labelExpanded : labelCollapsed}</Text>
      <Icon size={16} strokeWidth={2} color={typography.buttonLabel.color} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 },
  label: { ...typography.buttonLabel },
});

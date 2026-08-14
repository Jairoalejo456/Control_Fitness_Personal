import { Check } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { colors, radii } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Props = {
  done: boolean;
  onPress: () => void;
};

export function CheckCircleButton({ done, onPress }: Props) {
  return (
    <PressableScale accessibilityLabel="Marcar serie completada" onPress={onPress} style={[styles.button, done && styles.buttonDone]}>
      <Check size={18} color={done ? colors.background : colors.accent} strokeWidth={2.5} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radii.buttonSm,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDone: { backgroundColor: colors.accent },
});

import { Card, CardKicker } from '@/components/ui/Card';
import { Text } from 'react-native';
import { typography } from '@/theme/tokens';
import { WARMUP_NOTE } from '@/data/routineSeed';

export function WarmupCard() {
  return (
    <Card>
      <CardKicker>Calentamiento</CardKicker>
      <Text style={typography.body}>{WARMUP_NOTE}</Text>
    </Card>
  );
}

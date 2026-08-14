import { StyleSheet, View } from 'react-native';

import type { UserConfig } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { FieldRow } from '@/components/ui/FieldRow';
import { Stepper } from '@/components/ui/Stepper';
import { NumericInput } from '@/components/ui/NumericInput';

type Props = {
  config: Pick<UserConfig, 'caloriasObjetivo' | 'proteinaMinG' | 'proteinaIdealG' | 'suenoIdealH'>;
  onChange: (partial: Partial<UserConfig>) => void;
};

export function NutritionSleepGoalsCard({ config, onChange }: Props) {
  return (
    <Card>
      <CardKicker>Metas nutricionales y sueño</CardKicker>
      <FieldRow label="Calorías objetivo">
        <NumericInput
          value={config.caloriasObjetivo}
          onChange={(v) => onChange({ caloriasObjetivo: v ?? config.caloriasObjetivo })}
          width={90}
        />
      </FieldRow>
      <FieldRow label="Proteína mínima / ideal">
        <View style={styles.pair}>
          <NumericInput
            value={config.proteinaMinG}
            onChange={(v) => onChange({ proteinaMinG: v ?? config.proteinaMinG })}
            width={70}
          />
          <NumericInput
            value={config.proteinaIdealG}
            onChange={(v) => onChange({ proteinaIdealG: v ?? config.proteinaIdealG })}
            width={70}
          />
        </View>
      </FieldRow>
      <FieldRow label="Sueño ideal">
        <Stepper
          value={config.suenoIdealH}
          step={0.5}
          formatValue={(v) => `${v} h`}
          onChange={(suenoIdealH) => onChange({ suenoIdealH })}
        />
      </FieldRow>
    </Card>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 8 },
});

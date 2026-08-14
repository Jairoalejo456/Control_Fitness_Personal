import type { UserConfig } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { FieldRow } from '@/components/ui/FieldRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { NumericInput } from '@/components/ui/NumericInput';

type Props = {
  config: Pick<UserConfig, 'edad' | 'sexo' | 'estaturaM'>;
  onChange: (partial: Partial<UserConfig>) => void;
};

export function PersonalDataCard({ config, onChange }: Props) {
  return (
    <Card>
      <CardKicker>Datos personales</CardKicker>
      <FieldRow label="Edad">
        <NumericInput value={config.edad} onChange={(v) => onChange({ edad: v ?? 0 })} width={72} />
      </FieldRow>
      <FieldRow label="Sexo">
        <SegmentedControl
          options={[
            { label: 'Hombre', value: 'hombre' },
            { label: 'Mujer', value: 'mujer' },
          ]}
          value={config.sexo}
          onChange={(sexo) => onChange({ sexo })}
        />
      </FieldRow>
      <FieldRow label="Estatura">
        <Stepper
          value={config.estaturaM}
          step={0.01}
          decimals={2}
          formatValue={(v) => `${v.toFixed(2)} m`}
          onChange={(estaturaM) => onChange({ estaturaM })}
        />
      </FieldRow>
    </Card>
  );
}

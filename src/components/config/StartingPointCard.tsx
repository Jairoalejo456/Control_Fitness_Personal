import { StyleSheet, Text } from 'react-native';
import { CalendarDays, Flag, Hourglass, Ruler, Scale } from 'lucide-react-native';

import type { UserConfig } from '@/types/models';
import { Card, CardKicker } from '@/components/ui/Card';
import { FieldRow } from '@/components/ui/FieldRow';
import { Stepper } from '@/components/ui/Stepper';
import { NumericInput } from '@/components/ui/NumericInput';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { typography } from '@/theme/tokens';

type Props = {
  config: Pick<UserConfig, 'pesoInicialKg' | 'cinturaInicialCm' | 'fechaInicioPlan' | 'duracionSemanas'>;
  onChange: (partial: Partial<UserConfig>) => void;
  /** En Configuración se muestra la nota sobre la cintura inicial provisional; en Onboarding no aplica todavía. */
  showCinturaNote?: boolean;
};

export function StartingPointCard({ config, onChange, showCinturaNote }: Props) {
  return (
    <Card>
      <CardKicker icon={Flag}>Punto de partida</CardKicker>
      <FieldRow label="Peso inicial" icon={Scale}>
        <Stepper
          value={config.pesoInicialKg}
          step={0.5}
          formatValue={(v) => `${v.toFixed(2)} kg`}
          onChange={(pesoInicialKg) => onChange({ pesoInicialKg })}
        />
      </FieldRow>
      <FieldRow label="Cintura inicial" icon={Ruler}>
        <Stepper
          value={config.cinturaInicialCm}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} cm`}
          onChange={(cinturaInicialCm) => onChange({ cinturaInicialCm })}
        />
      </FieldRow>
      {showCinturaNote ? (
        <Text style={styles.note}>
          La cintura inicial fue medida después de comer y queda marcada como referencia provisional.
          Reemplázala por el promedio de 3 mediciones en ayunas cuando lo tengas.
        </Text>
      ) : null}
      <FieldRow label="Inicio del plan" icon={CalendarDays}>
        <DatePickerField value={config.fechaInicioPlan} onChange={(fechaInicioPlan) => onChange({ fechaInicioPlan })} />
      </FieldRow>
      <FieldRow label="Duración (semanas)" icon={Hourglass}>
        <NumericInput
          value={config.duracionSemanas}
          onChange={(v) => onChange({ duracionSemanas: v ?? config.duracionSemanas })}
          width={72}
        />
      </FieldRow>
    </Card>
  );
}

const styles = StyleSheet.create({
  note: { ...typography.bodySecondary },
});

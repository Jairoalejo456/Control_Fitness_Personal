import { createElement } from 'react';

import { colors, radii, typography } from '@/theme/tokens';
import type { ISODateString } from '@/types/models';

type Props = {
  value: ISODateString;
  onChange: (iso: ISODateString) => void;
  max?: ISODateString;
};

/**
 * Input de fecha nativo del navegador (solo se usa en la plataforma web —
 * @react-native-community/datetimepicker no tiene implementación web).
 * Se construye con createElement para no depender de tipos JSX de DOM en un proyecto RN.
 */
export function HtmlDateInput({ value, onChange, max }: Props) {
  return createElement('input', {
    type: 'date',
    value,
    max,
    onChange: (event: { target: { value: string } }) => {
      if (event.target.value) onChange(event.target.value);
    },
    style: {
      backgroundColor: colors.card,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.buttonSm,
      padding: '10px 12px',
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      colorScheme: 'dark',
    },
  });
}

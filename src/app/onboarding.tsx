import { useState } from 'react';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Button } from '@/components/ui/Button';
import { PersonalDataCard } from '@/components/config/PersonalDataCard';
import { StartingPointCard } from '@/components/config/StartingPointCard';
import { NutritionSleepGoalsCard } from '@/components/config/NutritionSleepGoalsCard';
import { getDefaultConfig } from '@/data/defaultConfig';
import { useAppStore } from '@/store/appStore';
import type { UserConfig } from '@/types/models';

export default function OnboardingScreen() {
  const [draft, setDraft] = useState<UserConfig>(getDefaultConfig);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const updateDraft = (partial: Partial<UserConfig>) => setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <Screen bottomSafeArea>
      <ScreenTitle
        kicker="Bienvenido"
        title="Configura tu plan"
        subtitle="Solo se pide una vez — podrás cambiarlo luego en Configuración."
      />
      <PersonalDataCard config={draft} onChange={updateDraft} />
      <StartingPointCard config={draft} onChange={updateDraft} />
      <NutritionSleepGoalsCard config={draft} onChange={updateDraft} />
      <Button label="Comenzar" onPress={() => completeOnboarding(draft)} />
    </Screen>
  );
}

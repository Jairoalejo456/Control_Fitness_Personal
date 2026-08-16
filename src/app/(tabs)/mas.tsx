import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Card, CardKicker } from '@/components/ui/Card';
import { ChevronRow } from '@/components/ui/ChevronRow';
import { PersonalDataCard } from '@/components/config/PersonalDataCard';
import { StartingPointCard } from '@/components/config/StartingPointCard';
import { NutritionSleepGoalsCard } from '@/components/config/NutritionSleepGoalsCard';
import { BackupCard } from '@/components/config/BackupCard';
import { useAppStore } from '@/store/appStore';
import { formatDisplayDate } from '@/logic/dateUtils';
import type { UserConfig } from '@/types/models';

export default function MasScreen() {
  const config = useAppStore((s) => s.config);
  const setConfig = useAppStore((s) => s.setConfig);

  const updateConfig = (partial: Partial<UserConfig>) => setConfig(partial);

  return (
    <Screen>
      <ScreenTitle kicker="Más" title="Configuración" subtitle={`Inicio del plan: ${formatDisplayDate(config.fechaInicioPlan)}`} />
      <PersonalDataCard config={config} onChange={updateConfig} />
      <StartingPointCard config={config} onChange={updateConfig} showCinturaNote />
      <NutritionSleepGoalsCard config={config} onChange={updateConfig} />
      <BackupCard />
      <Card>
        <CardKicker>Rutina</CardKicker>
        <ChevronRow label="Administrar ejercicios" onPress={() => router.push('/administrar-ejercicios')} />
      </Card>
    </Screen>
  );
}

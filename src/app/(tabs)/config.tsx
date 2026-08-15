import { router } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { APP_VERSION } from '@/generatedVersion';
import { typography, spacing } from '@/theme/tokens';
import { useViewportDebugInfo } from '@/hooks/useViewportDebugInfo';

export default function ConfigScreen() {
  const config = useAppStore((s) => s.config);
  const setConfig = useAppStore((s) => s.setConfig);
  const debugInfo = useViewportDebugInfo();
  const rawInsets = useSafeAreaInsets();

  const updateConfig = (partial: Partial<UserConfig>) => setConfig(partial);

  return (
    <Screen>
      <ScreenTitle kicker="Configuración" title="Datos del plan" subtitle={`Inicio: ${formatDisplayDate(config.fechaInicioPlan)}`} />
      <PersonalDataCard config={config} onChange={updateConfig} />
      <StartingPointCard config={config} onChange={updateConfig} showCinturaNote />
      <NutritionSleepGoalsCard config={config} onChange={updateConfig} />
      <BackupCard />
      <Card>
        <CardKicker>Rutina</CardKicker>
        <ChevronRow label="Administrar ejercicios" onPress={() => router.push('/administrar-ejercicios')} />
      </Card>

      {Platform.OS === 'web' ? (
        <Card>
          <CardKicker>Diagnóstico</CardKicker>
          <Text style={typography.bodySecondary}>Versión: {APP_VERSION}</Text>
          {debugInfo ? (
            <View style={{ gap: spacing.xs / 2 }}>
              <Text style={typography.bodySecondary}>
                window: {debugInfo.windowW}×{debugInfo.windowH}
              </Text>
              <Text style={typography.bodySecondary}>
                visualViewport: {debugInfo.visualViewportW ?? '—'}×{debugInfo.visualViewportH ?? '—'}
              </Text>
              <Text style={typography.bodySecondary}>
                safe-area env(): top {debugInfo.safeTop}px · bottom {debugInfo.safeBottom}px
              </Text>
              <Text style={typography.bodySecondary}>
                useSafeAreaInsets() (librería): top {Math.round(rawInsets.top)}px · bottom {Math.round(rawInsets.bottom)}px
              </Text>
              <Text style={typography.bodySecondary}>--app-height: {debugInfo.appHeight || '—'}</Text>
              <Text style={typography.bodySecondary}>
                Modo standalone: navigator.standalone={String(debugInfo.isStandaloneIOS)} · display-mode=
                {String(debugInfo.isStandaloneDisplayMode)}
              </Text>
            </View>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

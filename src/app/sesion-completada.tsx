import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/appStore';
import { DAY_SCHEDULE } from '@/types/models';
import { getWeekDayName, todayISO } from '@/logic/dateUtils';
import { getSessionProgress } from '@/logic/sessionProgress';
import { colors, motion, spacing, typography } from '@/theme/tokens';

const screenEntering = FadeInUp.duration(motion.screenTransitionDuration)
  .easing(Easing.bezier(0.22, 1, 0.36, 1))
  .withInitialValues({ transform: [{ translateY: 10 }], opacity: 0 });

export default function SesionCompletadaScreen() {
  const today = todayISO();
  const customRoutine = useAppStore((s) => s.customRoutine);
  const exerciseSessions = useAppStore((s) => s.exerciseSessions);

  const weekDay = getWeekDayName(today);
  const activity = DAY_SCHEDULE[weekDay];
  const exercises = activity.type === 'fuerza' ? customRoutine[activity.plan] : [];
  const progress =
    activity.type === 'fuerza'
      ? getSessionProgress(
          exerciseSessions,
          today,
          activity.plan,
          exercises.map((e) => e.id),
        )
      : { done: 0, total: 0 };
  const planLabel = activity.type === 'fuerza' ? activity.planName : '';

  return (
    <Animated.View entering={screenEntering} style={styles.container}>
      <Animated.View style={styles.circle}>
        <Check size={32} color={colors.accent} strokeWidth={2.5} />
      </Animated.View>
      <Text style={styles.title}>Rutina completada</Text>
      <Text style={styles.subtitle}>
        {planLabel} · {exercises.length} ejercicios · {progress.total} series
      </Text>
      <Button label="Continuar" onPress={() => router.replace('/')} style={styles.button} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.body, fontSize: 22, fontFamily: typography.valueLarge.fontFamily, color: colors.textPrimary },
  subtitle: { ...typography.bodySecondary, textAlign: 'center' },
  button: { marginTop: spacing.lg, width: '100%' },
});

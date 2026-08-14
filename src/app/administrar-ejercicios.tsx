import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

import { Card, CardKicker } from '@/components/ui/Card';
import { TextAreaInput } from '@/components/ui/TextAreaInput';
import { DayTabs } from '@/components/training/DayTabs';
import { EditableExerciseRow } from '@/components/training/EditableExerciseRow';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppStore } from '@/store/appStore';
import { useUiStore } from '@/store/uiStore';
import { DAY_SCHEDULE, WEEK_DAYS, type RoutineExercise } from '@/types/models';
import { colors, spacing, typography } from '@/theme/tokens';

const ADMIN_DAYS = WEEK_DAYS.filter((d) => d !== 'domingo');

export default function AdministrarEjerciciosScreen() {
  const customRoutine = useAppStore((s) => s.customRoutine);
  const customCardioDesc = useAppStore((s) => s.customCardioDesc);
  const updateExercise = useAppStore((s) => s.updateExercise);
  const updateCardioDesc = useAppStore((s) => s.updateCardioDesc);
  const reorderExercises = useAppStore((s) => s.reorderExercises);

  const selectedDay = useUiStore((s) => s.adminSelectedDay);
  const setSelectedDay = useUiStore((s) => s.setAdminSelectedDay);

  const activity = DAY_SCHEDULE[selectedDay];
  const exercises = activity.type === 'fuerza' ? customRoutine[activity.plan] : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()}>
          <Text style={styles.backLink}>← Configuración</Text>
        </PressableScale>
        <Text style={styles.title}>Administrar ejercicios</Text>
        <Text style={styles.subtitle}>Nombres, series recomendadas y orden</Text>
        <View style={styles.tabsWrap}>
          <DayTabs days={ADMIN_DAYS} selected={selectedDay} onSelect={setSelectedDay} />
        </View>
      </View>

      {activity.type === 'fuerza' ? (
        <DraggableFlatList<RoutineExercise>
          data={exercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onDragEnd={({ data }) => reorderExercises(activity.plan, data.map((e) => e.id))}
          renderItem={({ item, drag, isActive }) => (
            <EditableExerciseRow
              exercise={item}
              isActive={isActive}
              onDrag={drag}
              onChange={(partial) => updateExercise(activity.plan, item.id, partial)}
            />
          )}
        />
      ) : null}

      {activity.type === 'cardio' ? (
        <View style={styles.listContent}>
          <Card>
            <CardKicker>Descripción de la sesión</CardKicker>
            <TextAreaInput
              value={customCardioDesc[activity.plan]}
              onChange={(text) => updateCardioDesc(activity.plan, text ?? '')}
              minHeight={100}
            />
          </Card>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: 56, gap: spacing.xs },
  backLink: { ...typography.kicker },
  title: { ...typography.screenTitle },
  subtitle: { ...typography.subtitle, marginBottom: spacing.sm },
  tabsWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl * 2, gap: spacing.md },
});

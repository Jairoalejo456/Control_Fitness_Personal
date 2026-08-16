import { Calendar, Dumbbell, BarChart3, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/theme/tokens';

export const TAB_ICONS: Record<string, LucideIcon> = {
  index: Calendar,
  entreno: Dumbbell,
  progreso: BarChart3,
  mas: Settings,
};

export function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const Icon = TAB_ICONS[name];
  if (!Icon) return null;
  return <Icon size={19} strokeWidth={1.75} color={focused ? colors.accent : colors.neutral} />;
}

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { colors, fonts } from '@/theme/tokens';
import { TabIcon } from '@/components/icons/TabIcons';
import { useCssSafeArea } from '@/hooks/useCssSafeArea';

const TAB_BAR_CONTENT_HEIGHT = 54;

// Web: la tab bar se desconecta por completo de si #root llega o no al borde
// real de la pantalla — se ancla directo al viewport con su propio
// position:fixed, en vez de depender de ser el último hijo de un contenedor
// que mida bien. bottom:0 en un elemento fijo es un mecanismo distinto y más
// directo que el que se usó (sin éxito) para #root.
const webFixedStyle =
  Platform.OS === 'web'
    ? ({ position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%' } as const as object)
    : null;

export default function TabsLayout() {
  const { bottom: bottomInset } = useCssSafeArea();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.neutral,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // Se fija explícitamente en vez de dejar que la librería calcule su propia
          // altura a partir de los insets — evita que una lectura de zona segura
          // inflada (visto en algunos navegadores web) agrande la tab bar.
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          ...webFixedStyle,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoy',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="entreno"
        options={{
          title: 'Entreno',
          tabBarIcon: ({ focused }) => <TabIcon name="entreno" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rutina"
        options={{
          title: 'Rutina',
          tabBarIcon: ({ focused }) => <TabIcon name="rutina" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="panel"
        options={{
          title: 'Panel',
          tabBarIcon: ({ focused }) => <TabIcon name="panel" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => <TabIcon name="config" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

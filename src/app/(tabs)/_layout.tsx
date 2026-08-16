import { Tabs } from 'expo-router';

import { colors, fonts } from '@/theme/tokens';
import { TabIcon } from '@/components/icons/TabIcons';
import { useCssSafeArea } from '@/hooks/useCssSafeArea';
import { useIsKeyboardOpen } from '@/hooks/useIsKeyboardOpen';

// El componente de tab bar de la librería (BottomTabItem) trae un padding interno
// fijo de 5px arriba y 5px abajo alrededor de ícono+etiqueta, no pisable desde
// screenOptions (confirmado leyendo su código fuente en node_modules) — ese es el
// piso real que no se puede bajar sin un tabBar custom. Para que la barra se sienta
// más baja de verdad (no solo menos aire) se achicó el ícono (22→19, en TabIcons.tsx)
// y el paddingTop (6→4), no solo este número — con contenido más chico el mismo
// margen de seguridad que ya funcionó en 57 (con ícono 22) ahora entra en menos alto.
const TAB_BAR_CONTENT_HEIGHT = 55;

// El home indicator reserva 34pt reales (env(safe-area-inset-bottom)) para que su
// gesto de swipe-to-home no compita con toques cerca del borde — es lo que hace
// cualquier app nativa de iOS. A pedido explícito del usuario se recorta a propósito
// acá (no en useCssSafeArea, que sigue devolviendo el valor real para el resto de la
// app) para que la tab bar quede más pegada al borde, asumiendo el riesgo de que un
// swipe justo sobre un ícono lo interprete el sistema en vez de la app.
const TAB_BAR_BOTTOM_PADDING_MAX = 23;

export default function TabsLayout() {
  const { bottom: bottomInset } = useCssSafeArea();
  const keyboardOpen = useIsKeyboardOpen();
  // Con el teclado abierto no hace falta reservar la zona del home indicator — el
  // teclado ya ocupa ese espacio, y reservarlo igual solo deja un hueco muerto entre
  // la tab bar y el teclado.
  const tabBarBottomPadding = keyboardOpen ? 0 : Math.min(bottomInset, TAB_BAR_BOTTOM_PADDING_MAX);

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
          // inflada (visto en algunos navegadores web) agrande la tab bar. En flujo
          // normal (último hijo del flex-column) — no position:fixed, que resultó no
          // ser confiable en este WebView standalone.
          height: TAB_BAR_CONTENT_HEIGHT + tabBarBottomPadding,
          paddingBottom: tabBarBottomPadding,
          paddingTop: 4,
          // Por default cada tab item es flex:1 y la fila de tabs ocupa el 100% del
          // ancho de la barra (los 5 quedan repartidos borde a borde). alignItems:
          // 'center' hace que esa fila se achique a su contenido real en vez de
          // estirarse, así tabBarItemStyle abajo (flex:0) puede juntar los íconos.
          alignItems: 'center',
        },
        tabBarItemStyle: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', marginHorizontal: 16 },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 13 },
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
        name="progreso"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ focused }) => <TabIcon name="progreso" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mas"
        options={{
          title: 'Más',
          tabBarIcon: ({ focused }) => <TabIcon name="mas" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// El home indicator real de cualquier iPhone actual no supera ~34-40pt. Si
// useSafeAreaInsets() llega a devolver algo mayor (visto en algunos navegadores/
// dispositivos al correr como PWA en web), lo topamos para que la tab bar y el
// padding inferior de las pantallas nunca se disparen de tamaño.
const MAX_BOTTOM_INSET = 40;

export function useBottomInset() {
  const insets = useSafeAreaInsets();
  return Math.min(insets.bottom, MAX_BOTTOM_INSET);
}

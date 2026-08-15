import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { useAppStore } from '@/store/appStore';

function exportFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `control-fitness-personal-${stamp}.json`;
}

function downloadJsonOnWeb(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Exporta el respaldo: en web dispara una descarga directa; en iOS/Android abre la hoja para compartir. */
export async function exportBackup(): Promise<void> {
  const json = useAppStore.getState().exportState();

  if (Platform.OS === 'web') {
    downloadJsonOnWeb(json, exportFileName());
    return;
  }

  const file = new File(Paths.document, exportFileName());
  if (file.exists) file.delete();
  file.create();
  file.write(json);

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Exportar respaldo' });
}

/** Importa un respaldo elegido por el usuario: en web lee el File del navegador directamente. */
export async function pickAndImportFile(): Promise<{ ok: boolean; error?: string }> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, error: 'cancelado' };
  }

  const asset = result.assets[0];
  const content = Platform.OS === 'web' && asset.file ? await asset.file.text() : await new File(asset.uri).text();

  return useAppStore.getState().importState(content);
}

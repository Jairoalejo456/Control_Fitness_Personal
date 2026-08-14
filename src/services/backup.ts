import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { useAppStore } from '@/store/appStore';

function exportFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `control-fitness-personal-${stamp}.json`;
}

export async function exportToFile(): Promise<string> {
  const json = useAppStore.getState().exportState();
  const file = new File(Paths.document, exportFileName());
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  return file.uri;
}

export async function shareExportedFile(fileUri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Exportar respaldo' });
}

export async function pickAndImportFile(): Promise<{ ok: boolean; error?: string }> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, error: 'cancelado' };
  }
  const file = new File(result.assets[0].uri);
  const content = await file.text();
  return useAppStore.getState().importState(content);
}

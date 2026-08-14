import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Card, CardKicker } from '@/components/ui/Card';
import { ChevronRow } from '@/components/ui/ChevronRow';
import { exportToFile, pickAndImportFile, shareExportedFile } from '@/services/backup';
import { colors, typography } from '@/theme/tokens';

export function BackupCard() {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const fileUri = await exportToFile();
      await shareExportedFile(fileUri);
    } catch (error) {
      Alert.alert('No se pudo exportar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Importar datos',
      'Esto reemplazará todos los datos actuales de la app con los del archivo que elijas. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              const result = await pickAndImportFile();
              if (!result.ok && result.error !== 'cancelado') {
                Alert.alert('No se pudo importar', result.error ?? 'Intenta de nuevo.');
              } else if (result.ok) {
                Alert.alert('Listo', 'Tus datos se restauraron correctamente.');
              }
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Card>
      <CardKicker>Datos y respaldo</CardKicker>
      <Text style={styles.hint}>
        Todo se guarda solo en este teléfono. Exporta un respaldo de vez en cuando por si cambias de equipo.
      </Text>
      <ChevronRow label="Exportar datos (JSON)" onPress={handleExport} subtitle={busy ? 'Procesando…' : undefined} />
      <ChevronRow label="Importar datos (JSON)" onPress={handleImport} subtitle={busy ? 'Procesando…' : undefined} />
    </Card>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.bodySecondary, color: colors.textSecondaryMuted },
});

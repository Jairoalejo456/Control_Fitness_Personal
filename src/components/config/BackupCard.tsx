import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card, CardKicker } from '@/components/ui/Card';
import { ChevronRow } from '@/components/ui/ChevronRow';
import { exportBackup, pickAndImportFile } from '@/services/backup';
import { confirmAsync, notify } from '@/utils/platformAlert';
import { colors, typography } from '@/theme/tokens';

export function BackupCard() {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
    } catch (error) {
      notify('No se pudo exportar', error instanceof Error ? error.message : 'Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    const confirmed = await confirmAsync(
      'Importar datos',
      'Esto reemplazará todos los datos actuales de la app con los del archivo que elijas. ¿Continuar?',
      'Importar',
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const result = await pickAndImportFile();
      if (!result.ok && result.error !== 'cancelado') {
        notify('No se pudo importar', result.error ?? 'Intenta de nuevo.');
      } else if (result.ok) {
        notify('Listo', 'Tus datos se restauraron correctamente.');
      }
    } finally {
      setBusy(false);
    }
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

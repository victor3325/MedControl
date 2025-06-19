import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.background,
  },
  title: {
    fontSize: AppTheme.fontSizes.title,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.lg,
    textAlign: 'center',
  },
  medicamentoItem: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  medicamentoNome: {
    fontSize: AppTheme.fontSizes.text,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  medicamentoDetalhes: {
    color: AppTheme.colors.textSecondary,
    fontSize: AppTheme.fontSizes.small,
  },
  medicamentoHorario: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.fontSizes.small,
  },
  semMedicamentos: {
    color: AppTheme.colors.textMuted,
    textAlign: 'center',
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fontSizes.text,
  },
  shareButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.sm,
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
  },
  shareButtonText: {
    color: AppTheme.colors.buttonText,
    fontWeight: 'bold',
    fontSize: AppTheme.fontSizes.text,
  },
});

export default styles; 
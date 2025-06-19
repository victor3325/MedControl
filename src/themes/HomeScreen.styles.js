import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.background,
  },
  welcomeContainer: {
    marginBottom: AppTheme.spacing.lg,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: AppTheme.fontSizes.title,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
  },
  input: {
    backgroundColor: AppTheme.colors.inputBackground,
    borderColor: AppTheme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
    fontSize: AppTheme.fontSizes.text,
  },
  navButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.lg,
    paddingVertical: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.md,
    alignItems: 'center',
    elevation: 2,
  },
  navButtonText: {
    color: AppTheme.colors.buttonText,
    fontSize: AppTheme.fontSizes.text,
    fontWeight: 'bold',
  },
  listaContainer: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    marginBottom: AppTheme.spacing.lg,
    elevation: 1,
  },
  listaTitulo: {
    fontSize: AppTheme.fontSizes.subtitle,
    color: AppTheme.colors.accent,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.sm,
  },
  medicamentoItem: {
    backgroundColor: AppTheme.colors.background,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.sm,
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
  buttonContainer: {
    marginBottom: AppTheme.spacing.sm,
  },
});

export default styles; 
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
  allergyTitle: {
    fontSize: AppTheme.fontSizes.text,
    fontWeight: '600',
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.sm,
    marginTop: AppTheme.spacing.lg,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  allergyInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: AppTheme.spacing.sm,
  },
  allergiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.lg,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppTheme.colors.card || '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    marginRight: AppTheme.spacing.sm,
    marginBottom: AppTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border || '#E0E0E0',
    maxWidth: '100%',
  },
  allergyChipText: {
    fontSize: AppTheme.fontSizes.text,
    color: AppTheme.colors.text,
    marginRight: AppTheme.spacing.xs || 6,
    maxWidth: 200,
  },
  allergyChipRemove: {
    marginLeft: AppTheme.spacing.xs || 4,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    maxHeight: 300,
  },
});

export default styles; 
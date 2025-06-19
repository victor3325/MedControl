import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.background,
  },
  label: {
    marginTop: AppTheme.spacing.lg,
    fontSize: AppTheme.fontSizes.text,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.colors.inputBorder,
    padding: AppTheme.spacing.md,
    marginTop: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.inputBackground,
    color: AppTheme.colors.text,
    fontSize: AppTheme.fontSizes.text,
  },
  saveButton: {
    backgroundColor: AppTheme.colors.button,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    marginTop: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: AppTheme.colors.buttonText,
    fontWeight: 'bold',
    fontSize: AppTheme.fontSizes.text,
    letterSpacing: 1,
  },
  deleteButton: {
    backgroundColor: AppTheme.colors.delete,
    paddingVertical: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    marginTop: AppTheme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: AppTheme.fontSizes.text,
    letterSpacing: 1,
  },
});

export default styles; 
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
  input: {
    backgroundColor: AppTheme.colors.inputBackground,
    borderColor: AppTheme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: AppTheme.borderRadius.md,
    padding: AppTheme.spacing.md,
    color: AppTheme.colors.text,
    marginBottom: AppTheme.spacing.md,
    fontSize: AppTheme.fontSizes.text,
  },
  button: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.lg,
    paddingVertical: AppTheme.spacing.md,
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
  },
  buttonText: {
    color: AppTheme.colors.buttonText,
    fontWeight: 'bold',
    fontSize: AppTheme.fontSizes.text,
  },
});

export default styles; 
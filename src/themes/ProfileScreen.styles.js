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
});

export default styles; 
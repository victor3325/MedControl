import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.background,
  },
  title: {
    fontSize: AppTheme.fontSizes.title,
    marginBottom: AppTheme.spacing.lg,
    textAlign: 'center',
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: AppTheme.colors.inputBorder,
    borderWidth: 1,
    marginBottom: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.md,
    backgroundColor: AppTheme.colors.inputBackground,
    color: AppTheme.colors.text,
    fontSize: AppTheme.fontSizes.text,
  },
  buttonSpacing: {
    marginBottom: AppTheme.spacing.md,
  },
});

export default styles; 
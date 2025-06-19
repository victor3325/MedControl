import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppTheme.spacing.xl,
    backgroundColor: AppTheme.colors.background,
  },
  input: {
    width: '80%',
    padding: AppTheme.spacing.md,
    borderWidth: 1,
    borderRadius: AppTheme.borderRadius.md,
    marginBottom: AppTheme.spacing.lg,
    textAlign: 'center',
    backgroundColor: AppTheme.colors.inputBackground,
    color: AppTheme.colors.text,
    borderColor: AppTheme.colors.inputBorder,
    fontSize: AppTheme.fontSizes.text,
  },
});

export default styles; 
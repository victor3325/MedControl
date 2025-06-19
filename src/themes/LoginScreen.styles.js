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
    textAlign: 'center',
    marginBottom: AppTheme.spacing.lg,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: AppTheme.spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppTheme.spacing.md,
  },
  userButton: {
    flex: 1,
    paddingVertical: AppTheme.spacing.md,
    paddingHorizontal: AppTheme.spacing.lg,
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.borderRadius.md,
    marginRight: AppTheme.spacing.sm,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  userName: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.fontSizes.text,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: AppTheme.colors.inputBorder,
    borderWidth: 1,
    borderRadius: AppTheme.borderRadius.sm,
    marginBottom: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.md,
    color: AppTheme.colors.text,
    backgroundColor: AppTheme.colors.inputBackground,
  },
  passwordContainer: {
    marginTop: AppTheme.spacing.lg,
  },
  buttonSpacing: {
    marginTop: AppTheme.spacing.lg,
  },
  shareButton: {
    backgroundColor: AppTheme.colors.primary,
    borderRadius: AppTheme.borderRadius.sm,
    padding: AppTheme.spacing.sm,
    marginLeft: AppTheme.spacing.sm,
  },
  shareButtonText: {
    color: AppTheme.colors.text,
    fontWeight: 'bold',
  },
});

export default styles; 
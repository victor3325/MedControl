import { StyleSheet } from 'react-native';
import AppTheme from './AppTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
    padding: AppTheme.spacing.lg,
  },
  header: {
    fontSize: AppTheme.fontSizes.subtitle,
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
    marginBottom: AppTheme.spacing.md,
  },
  userInfo: {
    fontSize: AppTheme.fontSizes.small,
    color: AppTheme.colors.textSecondary,
    marginBottom: AppTheme.spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.card,
    paddingVertical: AppTheme.spacing.sm,
    borderTopLeftRadius: AppTheme.borderRadius.sm,
    borderTopRightRadius: AppTheme.borderRadius.sm,
  },
  tableHeaderText: {
    color: AppTheme.colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 90,
    fontSize: AppTheme.fontSizes.small,
    paddingHorizontal: AppTheme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: AppTheme.colors.inputBackground,
    paddingVertical: AppTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppTheme.colors.border,
  },
  tableCell: {
    color: AppTheme.colors.text,
    textAlign: 'center',
    minWidth: 90,
    fontSize: AppTheme.fontSizes.small,
    paddingHorizontal: AppTheme.spacing.xs,
  },
  deleteButton: {
    backgroundColor: AppTheme.colors.delete,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: AppTheme.borderRadius.sm,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: AppTheme.colors.buttonText,
    fontSize: AppTheme.fontSizes.tiny,
    fontWeight: 'bold',
  },
  scrollableBody: {
    maxHeight: 400,
  },
});

export default styles; 
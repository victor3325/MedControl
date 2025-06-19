import { Alert } from 'react-native';
export default class AlertUtils {
  static showError(message, title = 'Erro') {
    Alert.alert(title, message);
  }
  static showSuccess(message, title = 'Sucesso') {
    Alert.alert(title, message);
  }
  static showConfirm(message, onConfirm, onCancel, title = 'Confirmação') {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm }
    ]);
  }
} 
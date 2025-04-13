import { Linking, Platform } from 'react-native';

export const requestAlarmPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      await Linking.openSettings(); // Abre as configurações do app para o usuário ativar a permissão
      console.log('Usuário deve conceder permissão de alarme exato manualmente');
    } catch (err) {
      console.warn('Erro ao abrir as configurações:', err);
    }
  } else {
    console.log('Permissão de alarme exato não necessária nesta versão do Android.');
  }
};
export const openExactAlarmSettings = () => {
  if (Platform.OS === 'android') {
    try {
      Linking.openSettings(); // Abre as configurações do app (onde tem a opção de alarme exato em muitos aparelhos)

      Alert.alert(
        'Permissão necessária',
        'Ative "Permitir alarmes exatos" para que as notificações funcionem corretamente.'
      );
    } catch (error) {
      console.error('Erro ao abrir configurações:', error);
    }
  } else {
    Alert.alert('Atenção', 'Esta opção só está disponível no Android.');
  }
};
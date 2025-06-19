import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import UserRepository from './src/repositories/UserRepository';
import MedicationRepository from './src/repositories/MedicationRepository';
import { initDatabase } from './src/database/DatabaseInit';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { checkBatteryOptimization, openBatterySettings } from './src/utils/BatteryOptimization';
import NotificationService from './src/services/NotificationService';  // ajuste o caminho se precisar

export default function App() {

  async function requestNotificationPermission() {
    const app = getApp();
    const messaging = getMessaging(app);
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;
    if (!enabled) {
      Alert.alert('Permissão de Notificação Negada', 'Ative manualmente nas configurações para receber alertas.');
    }
    return enabled;
  }

  let batteryAlertShown = false;

  const verifyBatteryOptimization = async () => {
    if (Platform.OS !== 'android') return;
    if (batteryAlertShown) return;
    const ignoring = await checkBatteryOptimization();
    if (!ignoring) {
      batteryAlertShown = true;
      Alert.alert(
        '⚠️ Otimização de Bateria Ativa',
        'Isso pode atrasar notificações importantes. Desative para que o app funcione corretamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: async () => {
              openBatterySettings();
              setTimeout(async () => {
                const ignoringAfter = await checkBatteryOptimization();
                if (!ignoringAfter) {
                  Alert.alert('Ainda está ativo', 'A otimização de bateria ainda está ativa.');
                }
              }, 4000);
            }
          }
        ],
        { cancelable: true }
      );
    }
  };

  const clearAndScheduleNotifications = async () => {
    // FCM não agenda notificações locais, apenas push. Simule ou use outra lib se necessário.
    console.log('🔁 Simulação: notificações seriam agendadas com FCM.');
  };

  useEffect(() => {
    const setupApp = async () => {

      const permissionGranted = await requestNotificationPermission();

      const ignoring = await checkBatteryOptimization();
      console.log('🔋 Está ignorando otimização de bateria?', ignoring);

      await verifyBatteryOptimization();

      initDatabase();
      await UserRepository.createTable();
      await MedicationRepository.createTable();

      await clearAndScheduleNotifications();
    };

    setupApp();
  }, []);

  return (
    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}

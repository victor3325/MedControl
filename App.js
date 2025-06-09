import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import UserRepository from './src/repositories/UserRepository';
import MedicationRepository from './src/repositories/MedicationRepository';
import { initDatabase } from './src/database/DatabaseInit';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { checkBatteryOptimization, openBatterySettings } from './src/utils/BatteryOptimization';
import NotificationService from './src/services/NotificationService';  // ajuste o caminho se precisar

export default function App() {

  async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permissão para Notificações',
          message: 'O app precisa de permissão para enviar notificações.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Negar',
          buttonNeutral: 'Perguntar depois',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const createNotificationChannel = async () => {
    try {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Canal Padrão',
          sound: 'default',
          importance: AndroidImportance.HIGH,
        });
        console.log(`📡 Canal criado: ${channelId}`);
      } else {
        Alert.alert(
          'Permissão de Notificação Negada',
          'Ative manualmente nas configurações para receber alertas.'
        );
      }
    } catch (error) {
      console.error('❌ Erro ao configurar notificações:', error);
    }
  };

  const verifyBatteryOptimization = async () => {
    const ignoring = await checkBatteryOptimization();
    if (!ignoring) {
      Alert.alert(
        '⚠️ Otimização de Bateria Ativa',
        'Isso pode atrasar notificações importantes. Desative para que o app funcione corretamente.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir Configurações', onPress: () => openBatterySettings() }
        ],
        { cancelable: true }
      );
    }
  };

  const clearAndScheduleNotifications = async () => {
    try {
      await notifee.cancelAllNotifications();

      const medications = await MedicationRepository.getAll();

      for (const med of medications) {
        // Garanta que med.horarios seja array de strings
        let horarios = med.horarios;
        if (!Array.isArray(horarios)) {
          try {
            horarios = JSON.parse(horarios);
            if (!Array.isArray(horarios)) horarios = [];
          } catch {
            horarios = [];
          }
        }

        if (horarios.length > 0) {
          await NotificationService.scheduleMedicationNotifications({
            id: med.id,
            nome: med.nome,
            horarios,
          });
        }
      }

      console.log('🔁 Notificações agendadas com base no banco de dados via NotificationService.');
    } catch (error) {
      console.error('Erro ao reagendar notificações:', error);
    }
  };

  useEffect(() => {
    const setupApp = async () => {
      const permissionGranted = await requestNotificationPermission();

      if (permissionGranted) {
        await createNotificationChannel();
      }

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

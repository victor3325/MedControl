import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import UserRepository from './src/repositories/UserRepository';
import MedicationRepository from './src/repositories/MedicationRepository';
import { initDatabase } from './src/database/DatabaseInit';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { PermissionsAndroid } from 'react-native';

export default function App() {

  // Função para solicitar permissão de notificações
  async function requestNotificationPermission() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Permissão para Notificação',
        message: 'Este aplicativo precisa da permissão para enviar notificações.',
        buttonNeutral: 'Perguntar depois',
        buttonNegative: 'Negar',
        buttonPositive: 'Permitir',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  // Função para criar o canal de notificação
  const createNotificationChannel = async () => {
    try {
      console.log('Solicitando permissão para notificações...');

      // Verifique a permissão de notificação
      const permissionStatus = await notifee.requestPermission();

      console.log('Status de permissão:', permissionStatus); // Log de permissão

      // Verifique a permissão diretamente
      if (permissionStatus?.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('Permissão concedida para notificações');

        // Criação do canal de notificações
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          sound: 'default',
          importance: AndroidImportance.HIGH, // Garantir que você usa diretamente o AndroidImportance do Notifee
        });

        console.log(`Canal de notificação criado com ID: ${channelId}`);
      } else if (permissionStatus?.authorizationStatus === AuthorizationStatus.DENIED) {
        console.log('Permissão para notificações foi negada');
        alert('Você precisa conceder permissão para notificações nas configurações do dispositivo.');
      } else {
        console.log('Status de permissão para notificações desconhecido', permissionStatus);
      }
    } catch (error) {
      console.error('Erro ao criar o canal de notificação:', error);
    }
  };

  useEffect(() => {
    const setupApp = async () => {
      // Solicitar permissão antes de criar o canal de notificação
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        // Criar o canal de notificações
        await createNotificationChannel();
      } else {
        console.log('Permissão de notificação não concedida');
      }

      // Inicializa o banco de dados
      initDatabase();

      // Cria as tabelas de usuários e medicamentos
      UserRepository.createTable();
      MedicationRepository.createTable();
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

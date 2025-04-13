import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, TextInput } from 'react-native';
import notifee, { TriggerType } from '@notifee/react-native'; // Importação correta

const TestNotificationScreen = () => {
  const [time, setTime] = useState('');

  const scheduleNotification = async () => {
    console.log('Iniciando agendamento de notificação');

    if (!time) {
      console.log('Erro: Horário não fornecido');
      Alert.alert('Erro', 'Por favor, insira um horário válido.');
      return;
    }

    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    console.log(`Horário informado: ${hours}:${minutes}`);

    if (isNaN(hours) || isNaN(minutes)) {
      console.log('Erro: Horário inválido');
      Alert.alert('Erro', 'Por favor, insira um horário válido no formato HH:mm.');
      return;
    }

    const notificationTime = new Date();
    notificationTime.setHours(hours);
    notificationTime.setMinutes(minutes);
    notificationTime.setSeconds(0);
    notificationTime.setMilliseconds(0);

    if (notificationTime.getTime() <= Date.now()) {
      console.log('Horário já passou hoje. Ajustando para amanhã...');
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const timestamp = notificationTime.getTime();
    console.log(`Notificação será agendada para: ${notificationTime.toString()}`);
    console.log('Timestamp da notificação:', timestamp);

    if (timestamp < Date.now()) {
      console.log('Erro: O horário agendado é no passado');
      Alert.alert('Erro', 'O horário agendado deve ser no futuro.');
      return;
    } else {
      console.log('Horário de notificação está no futuro. Agendando...');
    }

    console.log('Tentando agendar a notificação...');

    try {
      await notifee.createTriggerNotification(
        {
          title: 'Notificação Agendada',
          body: `Sua notificação está agendada para ${time}.`,
          android: {
            channelId: 'default',
            smallIcon: 'ic_launcher',
            sound: 'default',
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp,
        }
      );

      console.log('Notificação agendada com sucesso');
      Alert.alert('Notificação agendada!', `Notificação agendada para ${time}.`);
    } catch (error) {
      console.log(`Erro ao agendar a notificação: ${error.message}`);
      Alert.alert('Erro ao agendar', `Erro: ${error.message}`);
    }
  };

  // Função de máscara para entrada no formato HH:mm
  const handleTimeInput = (text) => {
    const cleaned = text.replace(/[^0-9]/g, ''); // Remove não números
    let formatted = cleaned;

    if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }

    setTime(formatted);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite o horário (HH:mm)"
        value={time}
        onChangeText={handleTimeInput}
        keyboardType="numeric"
        maxLength={5}
      />
      <Button title="Agendar Notificação" onPress={scheduleNotification} />
    </View>
  );
};

export default TestNotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
});

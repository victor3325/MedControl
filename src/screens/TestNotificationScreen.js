import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';
import AlertUtils from '../utils/AlertUtils';

const TestNotificationScreen = () => {
  const [time, setTime] = useState('');

  const scheduleNotification = async () => {
    if (!time) {
      AlertUtils.showError('Por favor, insira um horário válido.', 'Erro');
      return;
    }
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 || hours > 23 ||
      minutes < 0 || minutes > 59
    ) {
      AlertUtils.showError('Por favor, insira um horário válido no formato HH:mm (00:00–23:59).', 'Erro');
      return;
    }
    // FCM não agenda notificações locais, apenas push. Simule envio ou use outra lib se necessário.
    AlertUtils.showSuccess('Notificação seria agendada para ' + time + ' usando FCM.', 'Simulação');
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

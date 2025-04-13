import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

const NotificationService = {
  async cancelNotificationsByMedicationId(medicationId) {
    console.log(`🔄 Cancelando notificações para o medicamento ID: ${medicationId}`);

    const allTriggers = await notifee.getTriggerNotifications();
    console.log(`📋 Total de notificações agendadas: ${allTriggers.length}`);

    for (const trigger of allTriggers) {
      console.log(`🔍 Verificando notificação ID: ${trigger.notification?.id}`);
      console.log(`📦 Dados da notificação:`, trigger.notification?.data);

      if (trigger.notification?.data?.medicationId === String(medicationId)) {
        console.log(`❌ Cancelando notificação ID: ${trigger.notification?.id}`);
        await notifee.cancelNotification(trigger.notification.id);
      } else {
        console.log(`✅ Notificação ID: ${trigger.notification?.id} não pertence ao medicamento ${medicationId}`);
      }
    }

    console.log(`🚫 Todas notificações relacionadas ao medicamento ${medicationId} foram canceladas.`);
  },

  async scheduleMedicationNotifications({ id, nome, horarios }) {
    console.log("📅 Iniciando agendamento de notificações...");
    console.log("🆔 Medicamento ID:", id);
    console.log("💊 Nome:", nome);
    console.log("⏰ Horários recebidos:", horarios);

    try {
      for (let i = 0; i < horarios.length; i++) {
        const horario = horarios[i];
        console.log(`🔁 [${i}] Processando horário: ${horario}`);

        const [hour, minute] = horario.split(':').map(Number);
        if (isNaN(hour) || isNaN(minute)) {
          console.warn(`⛔ Horário inválido detectado: ${horario}`);
          continue;
        }

        const triggerDate = getNextTriggerDate(hour, minute);
        console.log(`⏳ Horário convertido para data: ${triggerDate.toString()}`);

        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: triggerDate.getTime(),
          repeatFrequency: 1,
          alarmManager: true,
        };

        const notificationId = `${id}-${i}`;

        console.log(`📨 Agendando notificação: ID = ${notificationId}, Hora = ${hour}:${minute}`);

        await notifee.createTriggerNotification(
          {
            id: notificationId,
            title: 'Hora do medicamento 💊',
            body: `Tome ${nome} às ${horario}`,
            android: {
              channelId: 'default',
              sound: 'default',
              pressAction: {
                id: 'default',
              },
            },
            data: {
              medicationId: String(id),
              horario,
              nome,
            },
          },
          trigger
        );

        console.log(`✅ Notificação ${notificationId} agendada para ${triggerDate.toLocaleString()}`);
      }

      console.log("🎉 Todas notificações foram agendadas com sucesso!");
    } catch (error) {
      console.error("❌ Erro inesperado ao agendar notificações:", error);
      throw error;
    }
  },
};

function getNextTriggerDate(hour, minute) {
  const now = new Date();
  const trigger = new Date();
  trigger.setHours(Number(hour), Number(minute), 0, 0);

  console.log('🧪 Agora:', now.toString(), '|', now.toLocaleTimeString());
  console.log('📌 Horário alvo:', trigger.toString(), '|', trigger.toLocaleTimeString());

  if (trigger <= now) {
    console.log('⚠️ Horário já passou. Agendando para o próximo dia.');
    trigger.setDate(trigger.getDate() + 1);
  } else {
    console.log('✅ Agendando para hoje.');
  }

  console.log('📅 Próximo horário de notificação:', trigger.toString(), '|', trigger.toLocaleTimeString());
  return trigger;
}

export default NotificationService;

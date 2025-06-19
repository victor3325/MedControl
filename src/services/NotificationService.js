import notifee, { TimestampTrigger, TriggerType, RepeatFrequency } from '@notifee/react-native';

const NotificationService = {
  async cancelNotificationsByMedicationId(medicationId) {
    console.log('[NotificationService] Cancelando notificações para medicationId:', medicationId);
    const triggers = await notifee.getTriggerNotifications();
    const idsToCancel = triggers
      .filter(n => n.notification.data?.medicationId === String(medicationId))
      .map(n => n.notification.id);
    for (const id of idsToCancel) {
      await notifee.cancelNotification(id);
      console.log(`[NotificationService] Notificação cancelada: ${id}`);
    }
    console.log(`[NotificationService] Canceladas notificações do medicamento ${medicationId}:`, idsToCancel);
  },

  async scheduleMedicationNotifications({ id, nome, horarios }) {
    console.log('[NotificationService] Agendando notificações locais...', { id, nome, horarios });
    let algumHorarioInvalido = false;
    for (let i = 0; i < horarios.length; i++) {
      const horario = horarios[i];
      const [hour, minute] = horario.split(':').map(Number);
      if (
        isNaN(hour) ||
        isNaN(minute) ||
        hour < 0 || hour > 23 ||
        minute < 0 || minute > 59
      ) {
        algumHorarioInvalido = true;
        console.warn(`[NotificationService] Horário inválido detectado: ${horario}`);
        continue;
      }
      const now = new Date();
      let triggerDate = new Date(now);
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate < now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };
      console.log('[NotificationService] Criando triggerNotification:', {
        id: `med_${id}_${hour}_${minute}`,
        title: 'Hora do medicamento',
        body: `Lembrete para tomar: ${nome} (${horario})`,
        trigger,
      });
      await notifee.createTriggerNotification(
        {
          id: `med_${id}_${hour}_${minute}`,
          title: 'Hora do medicamento',
          body: `Lembrete para tomar: ${nome} (${horario})`,
          android: {
            channelId: 'medcontrol_reminders',
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
          data: { medicationId: String(id) },
        },
        trigger
      );
      console.log(`[NotificationService] Notificação agendada para ${horario}`);
    }
    if (algumHorarioInvalido) {
      throw new Error('Um ou mais horários são inválidos. Corrija antes de agendar.');
    }
    console.log('[NotificationService] Todas notificações foram agendadas!');
  },

  async createChannelIfNeeded() {
    console.log('[NotificationService] Criando canal de notificações (se necessário)...');
    await notifee.createChannel({
      id: 'medcontrol_reminders',
      name: 'Lembretes de Medicação',
      importance: 4,
    });
    console.log('[NotificationService] Canal criado ou já existente.');
  },
};

export default NotificationService;

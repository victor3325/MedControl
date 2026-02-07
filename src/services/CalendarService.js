import RNCalendarEvents from 'react-native-calendar-events';
import dayjs from 'dayjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MedicationRepository from '../repositories/MedicationRepository';

// Verifica se o módulo está disponível
const isCalendarModuleAvailable = () => {
  try {
    return RNCalendarEvents && 
           typeof RNCalendarEvents === 'object' &&
           typeof RNCalendarEvents.requestPermissions === 'function' &&
           typeof RNCalendarEvents.findCalendars === 'function' &&
           typeof RNCalendarEvents.saveEvent === 'function';
  } catch (error) {
    console.warn('[CalendarService] Erro ao verificar disponibilidade do módulo:', error);
    return false;
  }
};

const CalendarService = {
  // Chave para salvar o calendário selecionado
  SELECTED_CALENDAR_KEY: '@medcontrol:selected_calendar_id',

  // Salva o ID do calendário selecionado pelo usuário
  saveSelectedCalendarId: async (calendarId) => {
    try {
      await AsyncStorage.setItem(CalendarService.SELECTED_CALENDAR_KEY, calendarId);
      console.log('[CalendarService] Calendário selecionado salvo:', calendarId);
    } catch (error) {
      console.error('[CalendarService] Erro ao salvar calendário selecionado:', error);
      throw error;
    }
  },

  // Carrega o ID do calendário selecionado pelo usuário
  getSelectedCalendarId: async () => {
    try {
      const calendarId = await AsyncStorage.getItem(CalendarService.SELECTED_CALENDAR_KEY);
      console.log('[CalendarService] Calendário selecionado carregado:', calendarId);
      return calendarId;
    } catch (error) {
      console.error('[CalendarService] Erro ao carregar calendário selecionado:', error);
      return null;
    }
  },

  // Busca todos os calendários disponíveis (sem filtrar)
  getAllCalendars: async () => {
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível para buscar calendários');
        return [];
      }
      
      const calendars = await RNCalendarEvents.findCalendars();
      console.log(`[CalendarService] Total de calendários encontrados: ${calendars.length}`);
      return calendars;
    } catch (error) {
      console.error('[CalendarService] Erro ao buscar calendários:', error);
      return [];
    }
  },

  // Solicita permissões de calendário
  requestPermissions: async () => {
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo react-native-calendar-events não está disponível');
        return false;
      }
      
      const status = await RNCalendarEvents.requestPermissions();
      return status === 'authorized';
    } catch (error) {
      console.error('[CalendarService] Erro ao solicitar permissões:', error);
      return false;
    }
  },

  // Encontra o calendário a ser usado (primeiro tenta o selecionado pelo usuário, depois o padrão)
  findDefaultCalendar: async () => {
    try {
      // Primeiro tenta usar o calendário selecionado pelo usuário
      const selectedCalendarId = await CalendarService.getSelectedCalendarId();
      if (selectedCalendarId) {
        // Verifica se o calendário ainda existe e é modificável
        const calendars = await CalendarService.getAllCalendars();
        const selectedCalendar = calendars.find(cal => cal.id === selectedCalendarId);
        
        if (selectedCalendar) {
          const isReadOnly = CalendarService.isReadOnlyCalendar(selectedCalendar);
          if (!isReadOnly && selectedCalendar.allowsModifications !== false) {
            console.log(`[CalendarService] Usando calendário selecionado pelo usuário: ${selectedCalendar.title} (${selectedCalendar.id})`);
            return selectedCalendarId;
          } else {
            console.warn('[CalendarService] Calendário selecionado não é mais modificável, procurando alternativo');
          }
        } else {
          console.warn('[CalendarService] Calendário selecionado não encontrado, procurando alternativo');
        }
      }

      // Se não tem calendário selecionado ou não é válido, busca um padrão
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível para buscar calendários');
        return null;
      }
      
      const calendars = await RNCalendarEvents.findCalendars();
      console.log(`[CalendarService] Calendários encontrados: ${calendars.length}`);
      
      if (calendars.length === 0) {
        console.warn('[CalendarService] Nenhum calendário encontrado no dispositivo');
        return null;
      }

      // Log detalhado dos calendários
      calendars.forEach((cal, index) => {
        console.log(`[CalendarService] Calendário ${index + 1}:`, {
          id: cal.id,
          title: cal.title,
          allowsModifications: cal.allowsModifications,
          source: cal.source,
        });
      });

      // Primeiro tenta encontrar um calendário que permite modificações E não é apenas leitura
      let writableCalendar = calendars.find(cal => 
        cal.allowsModifications === true && !CalendarService.isReadOnlyCalendar(cal)
      );
      
      // Se não encontrar, tenta encontrar qualquer calendário que não seja apenas leitura
      // MAS só se allowsModifications não for explicitamente false
      if (!writableCalendar) {
        writableCalendar = calendars.find(cal => 
          !CalendarService.isReadOnlyCalendar(cal) && cal.allowsModifications !== false
        );
      }

      // NÃO usa calendários apenas de leitura como último recurso
      // Se não encontrou nenhum modificável, retorna null para tentar criar sem calendarId
      if (!writableCalendar) {
        console.log('[CalendarService] Nenhum calendário modificável encontrado. Eventos serão criados sem especificar calendarId (usará o padrão)');
        return null;
      }

      // Verificação final: se o calendário encontrado é apenas leitura, não usa
      if (CalendarService.isReadOnlyCalendar(writableCalendar)) {
        console.log('[CalendarService] Calendário encontrado é apenas leitura, eventos serão criados sem especificar calendarId');
        return null;
      }

      console.log(`[CalendarService] Usando calendário padrão: ${writableCalendar.title} (${writableCalendar.id})`);
      return writableCalendar.id;
    } catch (error) {
      console.error('[CalendarService] Erro ao buscar calendários:', error);
      return null;
    }
  },

  // Função auxiliar para verificar se é calendário apenas leitura
  isReadOnlyCalendar: (cal) => {
    const title = cal.title?.toLowerCase() || '';
    return title.includes('holiday') || 
           title.includes('contact') || 
           title.includes('addressbook') ||
           title.includes('read-only') ||
           title.includes('somente leitura') ||
           cal.allowsModifications === false;
  },

  // Cria um evento único no calendário para um horário específico
  createSingleEvent: async (medication, horario, calendarId = null) => {
    console.log(`[CalendarService] ⚡ INÍCIO createSingleEvent - horário: ${horario}, calendarId fornecido: ${calendarId}`);
    try {
      console.log('[CalendarService] 📋 Passo 1: Solicitando permissões...');
      // Solicita permissões se necessário
      const hasPermission = await CalendarService.requestPermissions();
      console.log(`[CalendarService] 📋 Passo 1 concluído - Permissão: ${hasPermission}`);
      if (!hasPermission) {
        console.warn('[CalendarService] ⚠️ Permissões de calendário negadas');
        return null;
      }

      // Encontra calendário padrão se não fornecido
      let targetCalendarId = calendarId;
      let shouldTryWithoutCalendarId = false;
      
      if (!targetCalendarId) {
        targetCalendarId = await CalendarService.findDefaultCalendar();
        
        // Se não encontrou calendário modificável, SEMPRE tenta criar sem especificar calendarId
        if (!targetCalendarId) {
          console.warn('[CalendarService] Nenhum calendário modificável encontrado, criando evento sem especificar calendário (usará o padrão do sistema)');
          shouldTryWithoutCalendarId = true;
        } else {
          // Mesmo encontrando um calendário, verifica se não é apenas leitura
          // (proteção extra)
          try {
            if (!isCalendarModuleAvailable()) {
              console.warn('[CalendarService] ⚠️ Módulo não disponível para verificar calendário');
              shouldTryWithoutCalendarId = true;
              targetCalendarId = null;
            } else {
              const calendars = await RNCalendarEvents.findCalendars().catch(() => []);
              const foundCal = calendars.find(cal => cal.id === targetCalendarId);
              if (foundCal && (foundCal.allowsModifications === false || isReadOnlyCalendar(foundCal))) {
                console.warn('[CalendarService] Calendário encontrado é apenas leitura, criando evento sem especificar calendário');
                shouldTryWithoutCalendarId = true;
                targetCalendarId = null;
              }
            }
          } catch (checkError) {
            console.warn('[CalendarService] Erro ao verificar calendário:', checkError);
            shouldTryWithoutCalendarId = true;
            targetCalendarId = null;
          }
        }
      }
      

      console.log('[CalendarService] 📋 Passo 3: Validando entrada...');
      // Validação de entrada
      if (!medication || !medication.nome) {
        console.error('[CalendarService] ❌ Medicamento inválido ao criar evento:', medication);
        return null;
      }

      if (!horario || typeof horario !== 'string') {
        console.error('[CalendarService] ❌ Horário inválido:', horario);
        return null;
      }

      console.log('[CalendarService] 📋 Passo 4: Fazendo parse do horário...');
      // Parse do horário (formato HH:MM)
      const [hour, minute] = horario.split(':').map(Number);
      console.log(`[CalendarService] 📋 Passo 4 - Horário parseado: hour=${hour}, minute=${minute}`);
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        console.error('[CalendarService] ❌ Horário inválido (fora do range):', horario);
        return null;
      }

      console.log('[CalendarService] 📋 Passo 5: Criando datas...');
      const startDate = dayjs().hour(hour).minute(minute).second(0).millisecond(0);
      const endDate = startDate.add(30, 'minute'); // Duração de 30 minutos (duração do evento individual)
      console.log(`[CalendarService] 📋 Passo 5 - startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);

      // Cria evento recorrente diário até 1 ano a partir de hoje
      // O endDateRecurrence define quando a recorrência deve parar
      // IMPORTANTE: Para recorrência diária, o endDate deve ser no mesmo horário do startDate
      const endDateRecurrence = dayjs().hour(hour).minute(minute).second(0).millisecond(0).add(1, 'year').toISOString();
      console.log(`[CalendarService] 📋 Passo 5 - endDateRecurrence (fim da recorrência): ${endDateRecurrence}`);
      console.log(`[CalendarService] 📋 Passo 5 - Recorrência configurada: DIÁRIA (todos os dias) até ${endDateRecurrence}`);
      
      // Se a recorrência não funcionar, podemos criar eventos manualmente para múltiplos dias
      // Por enquanto, tentamos primeiro com recorrência

      console.log('[CalendarService] 📋 Passo 6: Montando eventDetails...');
      const eventDetails = {
        title: `💊 ${medication.nome || 'Medicamento'}`,
        notes: medication.mgPorDose ? `Dose: ${medication.mgPorDose} mg` : 'Medicamento',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(), // Duração do evento individual (30 minutos)
        recurrenceRule: {
          frequency: 'daily', // Recorrência diária
          interval: 1, // A cada 1 dia
          endDate: endDateRecurrence, // Para em 1 ano - quando a recorrência deve parar
        },
      };
      console.log(`[CalendarService] 📋 Passo 6 - recurrenceRule configurado:`, JSON.stringify(eventDetails.recurrenceRule, null, 2));
      console.log(`[CalendarService] 📋 Passo 6 - eventDetails completo ANTES de saveEvent:`, JSON.stringify(eventDetails, null, 2));

      // NUNCA adiciona calendarId se shouldTryWithoutCalendarId é true
      // Isso garante que não tentamos usar calendários apenas de leitura
      if (shouldTryWithoutCalendarId || !targetCalendarId) {
        // Garante que não tem calendarId - será criado no calendário padrão
        delete eventDetails.calendarId;
        console.log('[CalendarService] 📋 Passo 6 - calendarId removido (será usado padrão)');
      } else if (targetCalendarId) {
        // Só adiciona calendarId se foi encontrado e não é apenas leitura
        eventDetails.calendarId = targetCalendarId;
        console.log(`[CalendarService] 📋 Passo 6 - calendarId adicionado: ${targetCalendarId}`);
      }

      console.log(`[CalendarService] 📋 Passo 6 concluído - eventDetails:`, JSON.stringify(eventDetails, null, 2));
      console.log(`[CalendarService] 📋 Passo 7: Chamando RNCalendarEvents.saveEvent...`);

      try {
        console.log(`[CalendarService] 📋 Passo 7.1: ANTES de saveEvent - title: "${eventDetails.title}"`);
        console.log(`[CalendarService] 📋 Passo 7.1 - eventDetails completo:`, JSON.stringify(eventDetails, null, 2));
        
        // Wrapper de segurança para capturar qualquer erro não tratado
        let eventId = null;
        let saveError = null;
        
        // Tenta criar evento COM recurrenceRule primeiro (recorrência diária)
        console.log(`[CalendarService] 📋 Passo 7.1.1: Tentando criar evento COM recurrenceRule (recorrência diária)...`);
        console.log(`[CalendarService] 📋 Passo 7.1.1 - eventDetails com recurrenceRule:`, JSON.stringify(eventDetails, null, 2));
        
        try {
          if (!isCalendarModuleAvailable()) {
            console.warn('[CalendarService] ⚠️ Módulo não disponível para criar evento');
            return null;
          }
          
          // Usa Promise.race com timeout para evitar travamentos
          console.log(`[CalendarService] 📋 Passo 7.1.1.1: Criando Promise para saveEvent com recorrência...`);
          console.log(`[CalendarService] 📋 Passo 7.1.1.1 - eventDetails que será enviado:`, JSON.stringify(eventDetails, null, 2));
          console.log(`[CalendarService] 📋 Passo 7.1.1.1 - recurrenceRule presente?`, !!eventDetails.recurrenceRule);
          console.log(`[CalendarService] 📋 Passo 7.1.1.1 - recurrenceRule.frequency:`, eventDetails.recurrenceRule?.frequency);
          console.log(`[CalendarService] 📋 Passo 7.1.1.1 - recurrenceRule.endDate:`, eventDetails.recurrenceRule?.endDate);
          const savePromise = RNCalendarEvents.saveEvent(eventDetails.title, eventDetails);
          console.log(`[CalendarService] 📋 Passo 7.1.1.2: Promise criada, aguardando...`);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao criar evento com recorrência')), 10000)
          );
          
          console.log(`[CalendarService] 📋 Passo 7.1.1.3: Executando Promise.race...`);
          eventId = await Promise.race([savePromise, timeoutPromise]);
          console.log(`[CalendarService] 📋 Passo 7.1.1.4: Promise.race concluída, eventId: ${eventId}`);
          console.log(`[CalendarService] ✅ Passo 7.1.1 concluído - Evento COM recorrência criado: ${eventId}`);
        } catch (recurrenceError) {
          console.error(`[CalendarService] 📋 Passo 7.1.1 - ERRO ao criar evento com recorrência`);
          console.error(`[CalendarService] ❌ Erro ao criar evento com recurrenceRule:`, recurrenceError);
          console.error(`[CalendarService] ❌ Tipo:`, typeof recurrenceError);
          console.error(`[CalendarService] ❌ Mensagem:`, recurrenceError?.message);
          console.error(`[CalendarService] ❌ Stack:`, recurrenceError?.stack);
          saveError = recurrenceError;
          
          // Se falhou com recorrência, tenta sem recurrenceRule como fallback
          console.log(`[CalendarService] 📋 Passo 7.1.2: Tentando criar evento SIMPLES (sem recurrenceRule) como fallback...`);
          const eventDetailsSimple = {
            title: eventDetails.title,
            notes: eventDetails.notes,
            startDate: eventDetails.startDate,
            endDate: eventDetails.endDate,
          };
          
          // Preserva calendarId se existir
          if (eventDetails.calendarId) {
            eventDetailsSimple.calendarId = eventDetails.calendarId;
          }
          
          console.log(`[CalendarService] 📋 Passo 7.1.2 - eventDetailsSimple:`, JSON.stringify(eventDetailsSimple, null, 2));
          
          try {
            if (!isCalendarModuleAvailable()) {
              console.warn('[CalendarService] ⚠️ Módulo não disponível para criar evento simples');
              throw new Error('Módulo não disponível');
            }
            
            const savePromise = RNCalendarEvents.saveEvent(eventDetailsSimple.title, eventDetailsSimple);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao criar evento simples')), 10000)
            );
            
            eventId = await Promise.race([savePromise, timeoutPromise]);
            console.log(`[CalendarService] ⚠️ Passo 7.1.2 concluído - Evento SIMPLES criado (sem recorrência): ${eventId}`);
            console.warn(`[CalendarService] ⚠️ ATENÇÃO: Evento criado sem recorrência diária! Será apenas para o dia de hoje.`);
            saveError = null; // Limpa o erro anterior
          } catch (simpleError) {
            console.error(`[CalendarService] ❌ Erro ao criar evento simples:`, simpleError);
            console.error(`[CalendarService] ❌ Tipo:`, typeof simpleError);
            console.error(`[CalendarService] ❌ Mensagem:`, simpleError?.message);
            console.error(`[CalendarService] ❌ Stack:`, simpleError?.stack);
            saveError = simpleError;
          }
        }
        
        if (eventId) {
          console.log(`[CalendarService] 📋 Passo 7.1 concluído - Evento criado com sucesso: ${eventId}`);
          console.log(`[CalendarService] ✅ Evento criado com sucesso: ${eventId} para horário ${horario}`);
          return eventId;
        } else {
          // Se não conseguiu criar, lança o erro para ser capturado pelo catch externo
          throw saveError || new Error('Não foi possível criar o evento');
        }
      } catch (saveError) {
        console.error(`[CalendarService] ❌ ERRO em saveEvent:`, saveError);
        console.error(`[CalendarService] ❌ Tipo do erro:`, typeof saveError);
        console.error(`[CalendarService] ❌ Mensagem do erro:`, saveError?.message);
        console.error(`[CalendarService] ❌ Stack do erro:`, saveError?.stack);
        
        // Se falhou e tinha calendarId, tenta sem especificar calendarId
        if (eventDetails.calendarId && !shouldTryWithoutCalendarId) {
          console.warn(`[CalendarService] 📋 Passo 7.2: Tentando criar evento sem calendarId...`);
          const eventDetailsWithoutCalendar = { ...eventDetails };
          delete eventDetailsWithoutCalendar.calendarId;
          console.log(`[CalendarService] 📋 Passo 7.2 - eventDetails sem calendarId:`, JSON.stringify(eventDetailsWithoutCalendar, null, 2));
          
          try {
            if (!isCalendarModuleAvailable()) {
              console.warn('[CalendarService] ⚠️ Módulo não disponível para criar evento sem calendarId');
              return null;
            }
            
            console.log(`[CalendarService] 📋 Passo 7.2.1: Chamando saveEvent sem calendarId...`);
            const eventId = await RNCalendarEvents.saveEvent(eventDetailsWithoutCalendar.title, eventDetailsWithoutCalendar);
            console.log(`[CalendarService] 📋 Passo 7.2.1 concluído - Evento criado: ${eventId}`);
            console.log(`[CalendarService] ✅ Evento criado sem calendarId: ${eventId} para horário ${horario}`);
            return eventId;
          } catch (retryError) {
            console.error(`[CalendarService] ❌ ERRO ao criar evento mesmo sem calendarId:`, retryError);
            console.error(`[CalendarService] ❌ Tipo do erro (retry):`, typeof retryError);
            console.error(`[CalendarService] ❌ Mensagem do erro (retry):`, retryError?.message);
            console.error(`[CalendarService] ❌ Stack do erro (retry):`, retryError?.stack);
            // Retorna null em vez de lançar erro para não quebrar o app
            return null;
          }
        } else {
          console.log(`[CalendarService] 📋 Passo 7 - Não há calendarId para remover ou já estava sem calendarId`);
          // Retorna null em vez de lançar erro para não quebrar o app
          return null;
        }
      }
    } catch (error) {
      console.error(`[CalendarService] ❌ ERRO GERAL ao criar evento para ${horario}:`, error);
      console.error(`[CalendarService] ❌ Tipo do erro (geral):`, typeof error);
      console.error(`[CalendarService] ❌ Mensagem do erro (geral):`, error?.message);
      console.error(`[CalendarService] ❌ Stack do erro (geral):`, error?.stack);
      return null;
    } finally {
      console.log(`[CalendarService] 📋 FIM createSingleEvent - horário: ${horario}`);
    }
  },

  // Cria múltiplos eventos manualmente para um horário (um evento por dia)
  // Útil quando a recorrência não funciona corretamente
  createMultipleDailyEvents: async (medication, horario, daysAhead = 365) => {
    console.log(`[CalendarService] ⚡ INÍCIO createMultipleDailyEvents - horário: ${horario}, dias: ${daysAhead}`);
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível');
        return [];
      }

      const hasPermission = await CalendarService.requestPermissions();
      if (!hasPermission) {
        console.warn('[CalendarService] ⚠️ Permissões negadas');
        return [];
      }

      const [hour, minute] = horario.split(':').map(Number);
      if (isNaN(hour) || isNaN(minute)) {
        console.error('[CalendarService] ❌ Horário inválido:', horario);
        return [];
      }

      const eventIds = [];
      const targetCalendarId = await CalendarService.findDefaultCalendar();
      
      // Cria um evento para cada dia
      for (let day = 0; day < daysAhead; day++) {
        const startDate = dayjs().add(day, 'day').hour(hour).minute(minute).second(0).millisecond(0);
        const endDate = startDate.add(30, 'minute');

        const eventDetails = {
          title: `💊 ${medication.nome || 'Medicamento'}`,
          notes: medication.mgPorDose ? `Dose: ${medication.mgPorDose} mg` : 'Medicamento',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        };

        if (targetCalendarId) {
          eventDetails.calendarId = targetCalendarId;
        }

        try {
          const eventId = await RNCalendarEvents.saveEvent(eventDetails.title, eventDetails);
          if (eventId) {
            eventIds.push(eventId);
          }
          
          // Log a cada 30 dias para não poluir muito
          if (day % 30 === 0) {
            console.log(`[CalendarService] 📋 Criados ${eventIds.length} eventos até o dia ${day + 1}`);
          }
        } catch (error) {
          console.error(`[CalendarService] ❌ Erro ao criar evento para dia ${day + 1}:`, error);
          // Continua tentando os próximos dias
        }
      }

      console.log(`[CalendarService] ✅ createMultipleDailyEvents concluído - ${eventIds.length} eventos criados`);
      return eventIds;
    } catch (error) {
      console.error('[CalendarService] ❌ Erro em createMultipleDailyEvents:', error);
      return [];
    }
  },

  // Cria eventos no calendário para todos os horários de um medicamento
  createMedicationEvents: async (medication, horarios) => {
    console.log(`[CalendarService] ⚡ INÍCIO createMedicationEvents - medicamento:`, medication, ', horarios:', horarios);
    try {
      console.log('[CalendarService] 📋 Passo 1: Validando entrada...');
      // Validação de entrada
      if (!medication || !medication.nome) {
        console.error('[CalendarService] ❌ Medicamento inválido:', medication);
        return [];
      }

      if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
        console.warn('[CalendarService] ⚠️ Nenhum horário fornecido');
        return [];
      }

      console.log(`[CalendarService] 📋 Passo 2: Processando ${horarios.length} horários...`);
      const eventIds = [];
      
      for (let i = 0; i < horarios.length; i++) {
        const horario = horarios[i];
        console.log(`[CalendarService] 📋 Passo 2.${i + 1}: Processando horário ${i + 1}/${horarios.length}: ${horario}`);
        try {
          if (!horario || !horario.match(/^\d{2}:\d{2}$/)) {
            console.warn(`[CalendarService] ⚠️ Horário inválido ignorado: ${horario}`);
            continue;
          }

          console.log(`[CalendarService] 📋 Passo 2.${i + 1}.1: Criando eventos múltiplos para ${horario}...`);
          // Cria múltiplos eventos manualmente (um por dia) para garantir que apareçam todos os dias
          // A recorrência pode não funcionar corretamente no Android, então criamos manualmente
          const multipleEventIds = await CalendarService.createMultipleDailyEvents(medication, horario, 365);
          eventIds.push(...multipleEventIds);
          console.log(`[CalendarService] 📋 Passo 2.${i + 1}.1 concluído - ${multipleEventIds.length} eventos criados para ${horario}`);
          console.log(`[CalendarService] 📋 Passo 2.${i + 1} - Total de eventos: ${eventIds.length}`);
        } catch (error) {
          console.error(`[CalendarService] ❌ Erro ao criar evento para horário ${horario}:`, error);
          console.error(`[CalendarService] ❌ Tipo do erro:`, typeof error);
          console.error(`[CalendarService] ❌ Mensagem:`, error?.message);
          console.error(`[CalendarService] ❌ Stack:`, error?.stack);
          // Continua tentando os próximos horários mesmo se um falhar
        }
      }

      console.log(`[CalendarService] 📋 Passo 2 concluído - ${eventIds.length} eventos criados para ${medication.nome}`);
      console.log(`[CalendarService] ✅ FIM createMedicationEvents - retornando:`, eventIds);
      return eventIds;
    } catch (error) {
      console.error('[CalendarService] ❌ ERRO GERAL ao criar eventos do medicamento:', error);
      console.error('[CalendarService] ❌ Tipo do erro:', typeof error);
      console.error('[CalendarService] ❌ Mensagem:', error?.message);
      console.error('[CalendarService] ❌ Stack:', error?.stack);
      return [];
    }
  },

  // Sincroniza todos os eventos do calendário com os medicamentos do banco de dados
  // Remove todos os eventos antigos e recria para medicamentos existentes
  syncAllCalendarEvents: async (medications, onProgress) => {
    console.log('[CalendarService] ⚡ INÍCIO syncAllCalendarEvents');
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível');
        return { success: false, error: 'Módulo não disponível' };
      }

      // Solicita permissões
      const hasPermission = await CalendarService.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permissões negadas' };
      }

      let totalRemoved = 0;
      let totalCreated = 0;
      let errors = [];

      // Coleta todos os IDs de eventos existentes
      if (onProgress) onProgress('Coletando eventos existentes...');
      const allEventIds = [];
      
      for (const medication of medications) {
        if (medication.calendarEventIds) {
          try {
            const eventIds = Array.isArray(medication.calendarEventIds) 
              ? medication.calendarEventIds 
              : JSON.parse(medication.calendarEventIds || '[]');
            allEventIds.push(...eventIds);
          } catch (parseError) {
            console.error('[CalendarService] Erro ao parsear eventIds:', parseError);
          }
        }
      }

      console.log(`[CalendarService] Total de eventos a remover: ${allEventIds.length}`);

      // Remove todos os eventos antigos
      if (allEventIds.length > 0) {
        if (onProgress) onProgress(`Removendo ${allEventIds.length} evento(s) antigo(s)...`);
        try {
          await CalendarService.removeEvents(allEventIds);
          totalRemoved = allEventIds.length;
          console.log(`[CalendarService] ✅ ${totalRemoved} eventos removidos`);
        } catch (removeError) {
          console.error('[CalendarService] Erro ao remover eventos:', removeError);
          errors.push('Erro ao remover alguns eventos antigos');
        }
      }

      // Recria eventos para todos os medicamentos
      if (onProgress) onProgress(`Recriando eventos para ${medications.length} medicamento(s)...`);
      
      for (let i = 0; i < medications.length; i++) {
        const medication = medications[i];
        if (onProgress) {
          onProgress(`Processando medicamento ${i + 1}/${medications.length}: ${medication.nome}...`);
        }

        try {
          // Parse dos horários
          let horarios = [];
          if (medication.horarios) {
            try {
              horarios = Array.isArray(medication.horarios) 
                ? medication.horarios 
                : JSON.parse(medication.horarios || '[]');
            } catch (parseError) {
              console.error('[CalendarService] Erro ao parsear horários:', parseError);
              horarios = [];
            }
          }

          if (horarios.length === 0) {
            console.warn(`[CalendarService] Medicamento ${medication.nome} não tem horários`);
            continue;
          }

          // Cria eventos para este medicamento
          const eventIds = await CalendarService.createMedicationEvents(
            { nome: medication.nome, mgPorDose: medication.mgPorDose },
            horarios
          );

          if (eventIds && eventIds.length > 0) {
            // Atualiza o medicamento com os novos IDs
            const updatedMedication = {
              ...medication,
              calendarEventIds: eventIds,
            };
            await MedicationRepository.updateMedication(updatedMedication);
            totalCreated += eventIds.length;
            console.log(`[CalendarService] ✅ Criados ${eventIds.length} eventos para ${medication.nome}`);
          }
        } catch (medError) {
          console.error(`[CalendarService] Erro ao processar medicamento ${medication.nome}:`, medError);
          errors.push(`Erro ao processar ${medication.nome}`);
        }
      }

      console.log(`[CalendarService] ✅ Sincronização concluída: ${totalRemoved} removidos, ${totalCreated} criados`);
      return {
        success: true,
        removed: totalRemoved,
        created: totalCreated,
        errors: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      console.error('[CalendarService] Erro geral na sincronização:', error);
      return { success: false, error: error.message };
    }
  },

  // Busca e remove eventos órfãos do calendário (eventos que não estão no banco de dados)
  findAndRemoveOrphanEvents: async (medications, onProgress) => {
    console.log('[CalendarService] ⚡ INÍCIO findAndRemoveOrphanEvents');
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível');
        return { success: false, error: 'Módulo não disponível' };
      }

      // Solicita permissões
      const hasPermission = await CalendarService.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permissões negadas' };
      }

      // Coleta todos os IDs de eventos válidos do banco de dados
      if (onProgress) onProgress('Coletando eventos válidos do banco de dados...');
      const validEventIds = new Set();
      
      for (const medication of medications) {
        if (medication.calendarEventIds) {
          try {
            const eventIds = Array.isArray(medication.calendarEventIds) 
              ? medication.calendarEventIds 
              : JSON.parse(medication.calendarEventIds || '[]');
            eventIds.forEach(id => validEventIds.add(String(id)));
          } catch (parseError) {
            console.error('[CalendarService] Erro ao parsear eventIds:', parseError);
          }
        }
      }

      console.log(`[CalendarService] Eventos válidos no banco: ${validEventIds.size}`);

      // Busca TODOS os eventos do calendário que começam com "💊" (eventos do app)
      if (onProgress) onProgress('Buscando eventos do calendário...');
      
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1); // Busca eventos do último ano
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // Até 1 ano no futuro

      let allCalendarEvents = [];
      try {
        // Tenta usar findEvents (método mais comum)
        if (typeof RNCalendarEvents.findEvents === 'function') {
          allCalendarEvents = await RNCalendarEvents.findEvents(
            startDate.toISOString(),
            endDate.toISOString()
          );
          console.log(`[CalendarService] Total de eventos encontrados (findEvents): ${allCalendarEvents.length}`);
        } 
        // Se não existir, tenta fetchAllEvents
        else if (typeof RNCalendarEvents.fetchAllEvents === 'function') {
          allCalendarEvents = await RNCalendarEvents.fetchAllEvents(
            startDate.toISOString(),
            endDate.toISOString()
          );
          console.log(`[CalendarService] Total de eventos encontrados (fetchAllEvents): ${allCalendarEvents.length}`);
        }
        // Se não existir, tenta getAllEvents
        else if (typeof RNCalendarEvents.getAllEvents === 'function') {
          allCalendarEvents = await RNCalendarEvents.getAllEvents(
            startDate.toISOString(),
            endDate.toISOString()
          );
          console.log(`[CalendarService] Total de eventos encontrados (getAllEvents): ${allCalendarEvents.length}`);
        }
        else {
          console.error('[CalendarService] Nenhum método de busca de eventos disponível');
          return { success: false, error: 'Método de busca de eventos não disponível nesta versão do módulo' };
        }
      } catch (findError) {
        console.error('[CalendarService] Erro ao buscar eventos:', findError);
        return { success: false, error: `Erro ao buscar eventos: ${findError.message}` };
      }

      // Filtra apenas eventos do app (que começam com "💊")
      const appEvents = allCalendarEvents.filter(event => {
        const title = event.title || '';
        return title.startsWith('💊');
      });

      console.log(`[CalendarService] Eventos do app encontrados: ${appEvents.length}`);

      // Identifica eventos órfãos (que não estão no banco)
      const orphanEventIds = [];
      for (const event of appEvents) {
        const eventId = String(event.id);
        if (!validEventIds.has(eventId)) {
          orphanEventIds.push(eventId);
          console.log(`[CalendarService] Evento órfão encontrado: ${event.title} (ID: ${eventId})`);
        }
      }

      console.log(`[CalendarService] Total de eventos órfãos: ${orphanEventIds.length}`);

      if (orphanEventIds.length === 0) {
        return {
          success: true,
          removed: 0,
          message: 'Nenhum evento órfão encontrado',
        };
      }

      // Remove os eventos órfãos
      if (onProgress) onProgress(`Removendo ${orphanEventIds.length} evento(s) órfão(s)...`);
      
      let removed = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < orphanEventIds.length; i++) {
        const eventId = orphanEventIds[i];
        if (onProgress) {
          onProgress(`Removendo evento órfão ${i + 1}/${orphanEventIds.length}...`);
        }

        try {
          await RNCalendarEvents.removeEvent(eventId);
          removed++;
        } catch (error) {
          console.error(`[CalendarService] Erro ao remover evento órfão ${eventId}:`, error);
          failed++;
          errors.push(`Evento ${eventId}: ${error.message}`);
        }
      }

      console.log(`[CalendarService] ✅ Eventos órfãos removidos: ${removed}, Falharam: ${failed}`);
      
      return {
        success: true,
        removed,
        failed,
        totalFound: appEvents.length,
        validInDatabase: validEventIds.size,
        errors: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      console.error('[CalendarService] Erro ao buscar e remover eventos órfãos:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove eventos específicos por IDs (útil para remover eventos órfãos)
  removeEventsByIds: async (eventIds, onProgress) => {
    console.log('[CalendarService] ⚡ INÍCIO removeEventsByIds - removendo', eventIds.length, 'eventos');
    try {
      if (!isCalendarModuleAvailable()) {
        console.warn('[CalendarService] ⚠️ Módulo não disponível');
        return { success: false, error: 'Módulo não disponível' };
      }

      const hasPermission = await CalendarService.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permissões negadas' };
      }

      let removed = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < eventIds.length; i++) {
        const eventId = eventIds[i];
        if (onProgress) {
          onProgress(`Removendo evento ${i + 1}/${eventIds.length}...`);
        }

        try {
          await RNCalendarEvents.removeEvent(eventId);
          removed++;
        } catch (error) {
          console.error(`[CalendarService] Erro ao remover evento ${eventId}:`, error);
          failed++;
          errors.push(`Evento ${eventId}: ${error.message}`);
        }
      }

      console.log(`[CalendarService] ✅ Removidos: ${removed}, Falharam: ${failed}`);
      return {
        success: true,
        removed,
        failed,
        errors: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      console.error('[CalendarService] Erro ao remover eventos:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove eventos do calendário usando seus IDs
  removeEvents: async (eventIds) => {
    if (!eventIds || eventIds.length === 0) {
      return;
    }

    if (!isCalendarModuleAvailable()) {
      console.warn('[CalendarService] ⚠️ Módulo não disponível para remover eventos');
      return;
    }

    try {
      for (const eventId of eventIds) {
        try {
          await RNCalendarEvents.removeEvent(eventId);
          console.log(`[CalendarService] Evento removido: ${eventId}`);
        } catch (error) {
          console.warn(`[CalendarService] Erro ao remover evento ${eventId}:`, error);
        }
      }
    } catch (error) {
      console.error('[CalendarService] Erro ao remover eventos:', error);
    }
  },

  // Atualiza eventos: remove os antigos e cria novos
  updateMedicationEvents: async (medication, oldEventIds, newHorarios) => {
    try {
      // Remove eventos antigos
      if (oldEventIds && oldEventIds.length > 0) {
        await CalendarService.removeEvents(oldEventIds);
      }

      // Cria novos eventos
      const newEventIds = await CalendarService.createMedicationEvents(medication, newHorarios);
      return newEventIds;
    } catch (error) {
      console.error('[CalendarService] Erro ao atualizar eventos:', error);
      return [];
    }
  },
};

export default CalendarService;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarService from '../services/CalendarService';

const CalendarSelectionScreen = ({ navigation, route }) => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      setLoading(true);
      
      // Solicita permissões primeiro
      const hasPermission = await CalendarService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissão Necessária',
          'É necessário permitir o acesso ao calendário para continuar.',
          [
            {
              text: 'Cancelar',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: 'Tentar Novamente',
              onPress: loadCalendars,
            },
          ]
        );
        return;
      }

      // Busca todos os calendários disponíveis
      const allCalendars = await CalendarService.getAllCalendars();
      
      // Filtra apenas calendários modificáveis e agrupa por conta
      const writableCalendars = allCalendars.filter(cal => {
        const title = cal.title?.toLowerCase() || '';
        const isReadOnly = title.includes('holiday') || 
                          title.includes('contact') || 
                          title.includes('addressbook') ||
                          title.includes('read-only') ||
                          cal.allowsModifications === false;
        return !isReadOnly && cal.allowsModifications !== false;
      });

      // Agrupa por conta (source)
      const calendarsByAccount = {};
      writableCalendars.forEach(cal => {
        const account = cal.source || 'Outros';
        if (!calendarsByAccount[account]) {
          calendarsByAccount[account] = [];
        }
        calendarsByAccount[account].push(cal);
      });

      // Converte para array de objetos com conta e calendários
      const groupedCalendars = Object.keys(calendarsByAccount).map(account => ({
        account,
        calendars: calendarsByAccount[account],
      }));

      setCalendars(groupedCalendars);

      // Carrega o calendário já selecionado, se houver
      const savedCalendarId = await CalendarService.getSelectedCalendarId();
      if (savedCalendarId) {
        setSelectedCalendarId(savedCalendarId);
      }
    } catch (error) {
      console.error('[CalendarSelectionScreen] Erro ao carregar calendários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os calendários.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCalendar = async (calendarId) => {
    try {
      setSelectedCalendarId(calendarId);
      await CalendarService.saveSelectedCalendarId(calendarId);
      
      Alert.alert(
        'Calendário Selecionado',
        'O calendário foi salvo com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Se veio de uma rota específica, chama o callback
              if (route?.params?.onSelect) {
                route.params.onSelect(calendarId);
              } else {
                // Senão, volta para a tela anterior
                navigation.goBack();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[CalendarSelectionScreen] Erro ao salvar calendário:', error);
      Alert.alert('Erro', 'Não foi possível salvar a seleção.');
    }
  };

  const renderCalendarItem = ({ item }) => {
    const isSelected = selectedCalendarId === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.calendarItem, isSelected && styles.calendarItemSelected]}
        onPress={() => handleSelectCalendar(item.id)}
      >
        <View style={styles.calendarItemContent}>
          <Icon
            name={isSelected ? 'calendar-check' : 'calendar-outline'}
            size={24}
            color={isSelected ? '#4CAF50' : '#666'}
          />
          <View style={styles.calendarItemText}>
            <Text style={[styles.calendarTitle, isSelected && styles.calendarTitleSelected]}>
              {item.title}
            </Text>
            {item.source && (
              <Text style={styles.calendarSource}>{item.source}</Text>
            )}
          </View>
          {isSelected && (
            <Icon name="check-circle" size={24} color="#4CAF50" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAccountSection = ({ item }) => (
    <View style={styles.accountSection}>
      <Text style={styles.accountTitle}>{item.account}</Text>
      <FlatList
        data={item.calendars}
        renderItem={renderCalendarItem}
        keyExtractor={(cal) => cal.id}
        scrollEnabled={false}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando calendários...</Text>
      </View>
    );
  }

  if (calendars.length === 0) {
    return (
      <View style={styles.container}>
        <Icon name="calendar-alert" size={64} color="#999" />
        <Text style={styles.emptyText}>Nenhum calendário modificável encontrado</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadCalendars}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione um Calendário</Text>
        <Text style={styles.subtitle}>
          Escolha o calendário onde os eventos de medicamentos serão criados
        </Text>
      </View>

      <FlatList
        data={calendars}
        renderItem={renderAccountSection}
        keyExtractor={(item) => item.account}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 16,
  },
  accountSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  calendarItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calendarItemSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  calendarItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarItemText: {
    flex: 1,
    marginLeft: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  calendarTitleSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  calendarSource: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarSelectionScreen;

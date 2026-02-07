import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from '../context/UserContext';
import MedicationRepository from '../repositories/MedicationRepository';
import CalendarService from '../services/CalendarService';
import { useFocusEffect } from '@react-navigation/native';
import DateUtils from '../utils/DateUtils';
import MedicationUtils from '../utils/MedicationUtils';
import AlertUtils from '../utils/AlertUtils';
import UserRepository from '../repositories/UserRepository';
import AppTheme from '../themes/AppTheme';
import styles from '../themes/HomeScreen.styles';

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [proximosMedicamentos, setProximosMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState(user?.alergias || []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState('');

  // Atualiza alergias do contexto se usuário mudar
  React.useEffect(() => {
    setAlergias(user?.alergias || []);
  }, [user]);

  const handleAddAlergia = async () => {
    if (alergiaInput.trim() && !alergias.includes(alergiaInput.trim())) {
      const novasAlergias = [...alergias, alergiaInput.trim()];
      setAlergias(novasAlergias);
      setAlergiaInput('');
      // Atualiza no banco e contexto
      if (user) {
        await UserRepository.updateUser(user.id, user.username, novasAlergias);
        setUser({ ...user, alergias: novasAlergias });
      }
    }
  };

  const handleRemoveAlergia = async (alergia) => {
    const novasAlergias = alergias.filter(a => a !== alergia);
    setAlergias(novasAlergias);
    if (user) {
      await UserRepository.updateUser(user.id, user.username, novasAlergias);
      setUser({ ...user, alergias: novasAlergias });
    }
  };

  const handleSyncCalendar = async () => {
    Alert.alert(
      'Sincronizar Calendário',
      'Isso irá:\n1. Buscar e remover eventos órfãos (que não estão no banco)\n2. Remover eventos antigos\n3. Recriar eventos para os medicamentos existentes\n\nDeseja continuar?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sincronizar',
          onPress: async () => {
            setIsSyncing(true);
            setSyncStep('Preparando sincronização...');

            try {
              if (!user?.id) {
                AlertUtils.showError('Usuário não encontrado.', 'Erro');
                setIsSyncing(false);
                return;
              }

              // Busca todos os medicamentos do usuário
              setSyncStep('Buscando medicamentos no banco de dados...');
              const medications = await MedicationRepository.getMedicationsByUserId(user.id);
              
              if (medications.length === 0) {
                setSyncStep('Nenhum medicamento encontrado');
                await new Promise(resolve => setTimeout(resolve, 1000));
                AlertUtils.showError('Nenhum medicamento encontrado para sincronizar.', 'Aviso');
                setIsSyncing(false);
                return;
              }

              // Primeiro: busca e remove eventos órfãos
              setSyncStep('Buscando eventos órfãos no calendário...');
              const orphanResult = await CalendarService.findAndRemoveOrphanEvents(
                medications,
                (step) => setSyncStep(step)
              );

              let orphanRemoved = 0;
              if (orphanResult.success) {
                orphanRemoved = orphanResult.removed || 0;
                if (orphanRemoved > 0) {
                  setSyncStep(`${orphanRemoved} evento(s) órfão(s) removido(s)`);
                  await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                  setSyncStep('Nenhum evento órfão encontrado');
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              } else {
                console.warn('[HomeScreen] Erro ao remover eventos órfãos:', orphanResult.error);
                setSyncStep('Aviso: não foi possível buscar eventos órfãos');
                await new Promise(resolve => setTimeout(resolve, 300));
              }

              // Depois: sincroniza (remove eventos antigos e recria)
              setSyncStep('Sincronizando eventos...');
              const syncResult = await CalendarService.syncAllCalendarEvents(
                medications,
                (step) => setSyncStep(step)
              );

              if (syncResult.success) {
                setSyncStep('Concluído!');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                let message = `Sincronização concluída!\n\n`;
                if (orphanRemoved > 0) {
                  message += `• ${orphanRemoved} evento(s) órfão(s) removido(s)\n`;
                }
                message += `• ${syncResult.removed} evento(s) antigo(s) removido(s)\n`;
                message += `• ${syncResult.created} evento(s) criado(s)`;
                
                if (syncResult.errors && syncResult.errors.length > 0) {
                  message += `\n\nAvisos:\n${syncResult.errors.join('\n')}`;
                }

                AlertUtils.showSuccess(message, 'Sincronização Concluída');
              } else {
                AlertUtils.showError(
                  syncResult.error || 'Erro ao sincronizar eventos do calendário.',
                  'Erro'
                );
              }
            } catch (error) {
              console.error('[HomeScreen] Erro ao sincronizar calendário:', error);
              AlertUtils.showError('Erro inesperado ao sincronizar calendário.', 'Erro');
            } finally {
              setIsSyncing(false);
              setSyncStep('');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const fetchMedicamentos = async () => {
        if (!user?.id) {
          console.log('[fetchMedicamentos] Usuário não definido ou sem id');
          return;
        }

        setLoading(true);
        try {
          const meds = await MedicationRepository.getProximosMedicamentos(user.id);
          meds.forEach(med => console.log('Horários crus:', med.horarios));

          const medsComHorariosParseados = meds.map(med => ({
            ...med,
            horarios: DateUtils.safeParseHorarios(med.horarios),
          }));

          const now = new Date();
          const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

          const filtrados = medsComHorariosParseados.filter(med => {
            return med.horarios.some(horario => {
              if (!horario.includes(':')) return false;
              const [hh, mm] = horario.split(':').map(Number);
              const horarioDate = new Date(now);
              horarioDate.setHours(hh, mm, 0, 0);
              return horarioDate >= now && horarioDate <= sixHoursLater;
            });
          });

          setProximosMedicamentos(filtrados);
        } catch (error) {
          console.error('[fetchMedicamentos] Erro ao buscar medicamentos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMedicamentos();
    }, [user])
  );

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {user ? (
          <Text style={styles.welcomeText}>Bem-vindo, {user.username}!</Text>
        ) : (
          <Text style={styles.welcomeText}>Carregando usuário...</Text>
        )}
      </View>

      {/* Campo de alergias */}
      <Text style={styles.allergyTitle}>Sou alérgico(a) a:</Text>
      <View style={styles.allergyInputContainer}>
        <TextInput
          style={[styles.input, styles.allergyInput]}
          placeholder="Digite uma alergia"
          value={alergiaInput}
          onChangeText={setAlergiaInput}
          placeholderTextColor={AppTheme.colors.textMuted}
        />
        <Button title="Adicionar" onPress={handleAddAlergia} disabled={!alergiaInput.trim()} />
      </View>
      {alergias.length > 0 && (
        <View style={styles.allergiesList}>
          {alergias.map((alergia, idx) => (
            <View key={alergia + idx} style={styles.allergyChip}>
              <Text style={styles.allergyChipText} numberOfLines={1} ellipsizeMode="tail">
                {alergia.trim()}
              </Text>
              <TouchableOpacity 
                onPress={() => handleRemoveAlergia(alergia)}
                style={styles.allergyChipRemove}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={16} color={AppTheme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : proximosMedicamentos.length > 0 ? (
        <View style={styles.listaContainer}>
          <Text style={styles.listaTitulo}>Próximos Medicamentos (em até 6h)</Text>
          <ScrollView style={styles.scrollArea}>
            {proximosMedicamentos.map(item => {
              const quantidade = MedicationUtils.calcularQuantidade(item);
              return (
                <View key={item.id} style={styles.medicamentoItem}>
                  <Text style={styles.medicamentoNome}>{item.nome}</Text>
                  <Text style={styles.medicamentoDetalhes}>
                    Dose: {item.mgPorDose} mg - Quantidade: {quantidade} comprimidos
                  </Text>
                  <Text style={styles.medicamentoHorario}>
                    Horários: {item.horarios.join(', ')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.semMedicamentos}>Nenhum medicamento próximo encontrado.</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CadastroMedicamento')}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Criar Medicamento</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ListaMedicamentos')}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Listar Medicamentos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSyncCalendar}
          style={[styles.navButton, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
          activeOpacity={0.7}
        >
          <Icon name="calendar-sync" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.navButtonText}>Sincronizar Calendário</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de carregamento durante sincronização */}
      <Modal
        visible={isSyncing}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Não permite fechar durante a sincronização
      >
        <View style={syncStyles.loadingOverlay}>
          <View style={syncStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Icon name="calendar-sync" size={32} color="#4CAF50" style={syncStyles.syncIcon} />
            <Text style={syncStyles.loadingTitle}>Sincronizando Calendário</Text>
            <Text style={syncStyles.loadingStep}>{syncStep}</Text>
            <Text style={syncStyles.loadingSubtext}>Por favor, aguarde...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const syncStyles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  syncIcon: {
    marginTop: 16,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingStep: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;

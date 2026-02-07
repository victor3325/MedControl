import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MedicationRepository from '../repositories/MedicationRepository';
import { TextInputMask } from 'react-native-masked-text';
import NotificationService from '../services/NotificationService';
import CalendarService from '../services/CalendarService';
import { useUser } from '../context/UserContext';
import DateUtils from '../utils/DateUtils';
import AlertUtils from '../utils/AlertUtils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const CadastrarMedicamentoScreen = () => {
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [mgPorComprimido, setMgPorComprimido] = useState('');
  const [mgPorDose, setMgPorDose] = useState('');
  const [dosesPorDia, setDosesPorDia] = useState('');
  const [estoque, setEstoque] = useState('');
  const [horarios, setHorarios] = useState(['']);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState('');

  const scrollViewRef = useRef(null);
  const horarioRefs = useRef([]);

  useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
    } else {
      console.warn('[WARN] Usuário não encontrado no contexto.');
    }
  }, [user]);

  const handleHorarioChange = (text, index) => {
    const novosHorarios = [...horarios];
    novosHorarios[index] = text;
    setHorarios(novosHorarios);
  };

  const adicionarHorario = () => {
    setHorarios([...horarios, '']);
    setTimeout(() => {
      const novaRef = horarioRefs.current[horarios.length];
      if (novaRef && typeof novaRef.focus === 'function') {
        novaRef.focus();
      }
    }, 300);
  };

  const removerHorario = (index) => {
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    setSavingStep('Preparando cadastro...');
    
    try {
      console.log('[CadastroMedicamentoScreen] Iniciando cadastro...');
      if (!userId) {
        console.log('[CadastroMedicamentoScreen] Usuário não encontrado. userId:', userId);
        AlertUtils.showError('Usuário não encontrado.', 'Erro');
        setIsSaving(false);
        setSavingStep('');
        return;
      }

      const dataCadastro = new Date().toISOString();
      console.log('[CadastroMedicamentoScreen] dataCadastro:', dataCadastro);

      const newMedication = {
        nome,
        mgPorComprimido,
        mgPorDose,
        dosesPorDia,
        estoque,
        horarios,
        userId,
        dataCadastro,
      };
      console.log('[CadastroMedicamentoScreen] newMedication:', newMedication);

      setSavingStep('Salvando medicamento no banco de dados...');
      const insertedId = await MedicationRepository.createMedication(newMedication);
      console.log('[CadastroMedicamentoScreen] insertedId:', insertedId);

      if (insertedId) {
        setSavingStep('Medicamento salvo no banco de dados');
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          setSavingStep(`Agendando ${horarios.length} notificação(ões)...`);
          console.log('[CadastroMedicamentoScreen] Agendando notificações...');
          await NotificationService.scheduleMedicationNotifications({
            id: insertedId,
            nome,
            horarios,
          });
          setSavingStep('Notificações agendadas com sucesso');
          await new Promise(resolve => setTimeout(resolve, 300));
          console.log('[CadastroMedicamentoScreen] Notificações agendadas com sucesso!');

          // Criar eventos no calendário
          try {
            setSavingStep(`Criando eventos no calendário para ${horarios.length} horário(s)...`);
            console.log('[CadastroMedicamentoScreen] Criando eventos no calendário...');
            const eventIds = await CalendarService.createMedicationEvents(
              { nome, mgPorDose },
              horarios
            );
            
            if (eventIds && eventIds.length > 0) {
              setSavingStep(`Criados ${eventIds.length} evento(s) no calendário`);
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Atualizar medicamento com os IDs dos eventos criados
              setSavingStep('Salvando IDs dos eventos no banco de dados...');
              const updatedMedication = {
                ...newMedication,
                id: insertedId,
                calendarEventIds: eventIds,
              };
              await MedicationRepository.updateMedication(updatedMedication);
              setSavingStep('IDs dos eventos salvos');
              await new Promise(resolve => setTimeout(resolve, 300));
              console.log('[CadastroMedicamentoScreen] Eventos do calendário salvos:', eventIds.length);
            } else {
              setSavingStep('Aviso: nenhum evento foi criado no calendário');
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          } catch (calendarError) {
            console.error('[CadastroMedicamentoScreen] Erro ao criar eventos no calendário:', calendarError);
            setSavingStep('Aviso: alguns eventos do calendário não puderam ser criados');
            await new Promise(resolve => setTimeout(resolve, 300));
            // Não bloqueia o cadastro se falhar ao criar eventos no calendário
          }

          setSavingStep('Concluído!');
          await new Promise(resolve => setTimeout(resolve, 500));
          AlertUtils.showSuccess('Medicamento cadastrado com sucesso!', 'Sucesso');
          navigation.goBack();
        } catch (err) {
          console.error('[CadastroMedicamentoScreen] Erro ao agendar notificações:', err);
          AlertUtils.showError('Erro ao agendar notificações. O medicamento foi cadastrado, mas as notificações podem não funcionar.', 'Aviso');
          // Ainda mostra sucesso e volta, pois o medicamento foi salvo
          AlertUtils.showSuccess('Medicamento cadastrado com sucesso!', 'Sucesso');
          navigation.goBack();
        }
      } else {
        console.error('[CadastroMedicamentoScreen] Erro ao salvar o medicamento.');
        AlertUtils.showError('Erro ao salvar o medicamento.', 'Erro');
      }
    } catch (error) {
      console.error('[CadastroMedicamentoScreen] Erro inesperado ao cadastrar:', error);
      AlertUtils.showError('Erro inesperado ao cadastrar o medicamento.', 'Erro');
    } finally {
      setIsSaving(false);
      setSavingStep('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do medicamento"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={mgPorComprimido}
          onChangeText={setMgPorComprimido}
          keyboardType="numeric"
          placeholder="Mg por comprimido"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={mgPorDose}
          onChangeText={setMgPorDose}
          keyboardType="numeric"
          placeholder="Mg por dose"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={dosesPorDia}
          onChangeText={setDosesPorDia}
          keyboardType="numeric"
          placeholder="Doses por dia"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '9999' }}
          value={estoque}
          onChangeText={setEstoque}
          keyboardType="numeric"
          placeholder="Estoque"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.subtitle}>Horários:</Text>
        {horarios.map((hora, index) => (
          <View key={index} style={styles.horarioContainer}>
            <TextInputMask
              style={styles.horarioInput}
              type={'custom'}
              options={{ mask: '99:99' }}
              value={hora}
              placeholder="HH:MM"
              placeholderTextColor="#bbb"
              onChangeText={(text) => handleHorarioChange(text, index)}
              refInput={(ref) => (horarioRefs.current[index] = ref)} // <--- ref corrigido
            />
            <TouchableOpacity onPress={() => removerHorario(index)} style={styles.removerButton}>
              <Text style={styles.removerButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <Button title="Adicionar Horário" onPress={adicionarHorario} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Salvar" onPress={handleSalvar} />
        </View>
      </ScrollView>

      {/* Modal de carregamento durante cadastro */}
      <Modal
        visible={isSaving}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Não permite fechar durante o cadastro
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Icon name="plus-circle" size={32} color="#4CAF50" style={styles.saveIcon} />
            <Text style={styles.loadingTitle}>Cadastrando Medicamento</Text>
            <Text style={styles.loadingStep}>{savingStep}</Text>
            <Text style={styles.loadingSubtext}>Por favor, aguarde...</Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 8,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: height * 0.03,
    marginBottom: 10,
    color: '#fff',
  },
  horarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  horarioInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginRight: 10,
    color: '#fff',
    backgroundColor: '#333',
  },
  removerButton: {
    backgroundColor: '#f66',
    padding: 8,
    borderRadius: 5,
  },
  removerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
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
  saveIcon: {
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

export default CadastrarMedicamentoScreen;

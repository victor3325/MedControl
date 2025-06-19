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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MedicationRepository from '../repositories/MedicationRepository';
import { TextInputMask } from 'react-native-masked-text';
import NotificationService from '../services/NotificationService';
import { useUser } from '../context/UserContext';
import DateUtils from '../utils/DateUtils';
import AlertUtils from '../utils/AlertUtils';

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
    console.log('[CadastroMedicamentoScreen] Iniciando cadastro...');
    if (!userId) {
      console.log('[CadastroMedicamentoScreen] Usuário não encontrado. userId:', userId);
      AlertUtils.showError('Usuário não encontrado.', 'Erro');
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

    try {
      const insertedId = await MedicationRepository.createMedication(newMedication);
      console.log('[CadastroMedicamentoScreen] insertedId:', insertedId);

      if (insertedId) {
        try {
          console.log('[CadastroMedicamentoScreen] Agendando notificações...');
          await NotificationService.scheduleMedicationNotifications({
            id: insertedId,
            nome,
            horarios,
          });
          console.log('[CadastroMedicamentoScreen] Notificações agendadas com sucesso!');
          AlertUtils.showSuccess('Medicamento cadastrado com sucesso!', 'Sucesso');
        } catch (err) {
          console.error('[CadastroMedicamentoScreen] Erro ao agendar notificações:', err);
          AlertUtils.showError('Horário inválido para notificação. Corrija antes de salvar.', 'Erro');
        }
      } else {
        console.error('[CadastroMedicamentoScreen] Erro ao salvar o medicamento.');
        AlertUtils.showError('Erro ao salvar o medicamento.', 'Erro');
      }
    } catch (error) {
      console.error('[CadastroMedicamentoScreen] Erro inesperado ao cadastrar:', error);
      AlertUtils.showError('Erro inesperado ao cadastrar o medicamento.', 'Erro');
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
});

export default CadastrarMedicamentoScreen;

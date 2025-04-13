import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
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

  useEffect(() => {
    console.log('[DEBUG] user context:', user);
    if (user && user.id) {
      setUserId(user.id);
      console.log('[DEBUG] userId set to:', user.id);
    } else {
      console.warn('[WARN] Usuário não encontrado no contexto.');
    }
  }, [user]);

  const handleHorarioChange = (text, index) => {
    console.log(`[DEBUG] handleHorarioChange - index: ${index}, value: ${text}`);
    const novosHorarios = [...horarios];
    novosHorarios[index] = text;
    setHorarios(novosHorarios);
  };

  const adicionarHorario = () => {
    console.log('[DEBUG] adicionarHorario chamado');
    setHorarios([...horarios, '']);
  };

  const removerHorario = (index) => {
    console.log('[DEBUG] removerHorario - index:', index);
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  const handleSalvar = async () => {
    console.log('[DEBUG] handleSalvar chamado');
    console.log('[DEBUG] userId:', userId);

    if (!userId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    // Adicionando a data de cadastro no formato dd/mm/yyyy
    const dataCadastro = new Date().toLocaleDateString('pt-BR'); // Formato dd/mm/yyyy

    const newMedication = {
      nome,
      mgPorComprimido,
      mgPorDose,
      dosesPorDia,
      estoque,
      horarios,
      userId,
      dataCadastro, // Salvando a data de cadastro no formato desejado
    };

    console.log('[DEBUG] newMedication:', newMedication);

    try {
      const insertedId = await MedicationRepository.createMedication(newMedication);
      console.log('[DEBUG] insertedId:', insertedId);

      if (insertedId) {
        await NotificationService.scheduleMedicationNotifications({
          id: insertedId,
          nome,
          horarios,
        });
        console.log('[DEBUG] Notificações agendadas com sucesso');

        Alert.alert('Sucesso', 'Medicamento cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Erro', 'Erro ao salvar o medicamento.');
      }
    } catch (error) {
      console.error('[ERRO] Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Erro inesperado ao cadastrar o medicamento.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={(text) => {
            console.log('[DEBUG] nome:', text);
            setNome(text);
          }}
          placeholder="Nome do medicamento"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={mgPorComprimido}
          onChangeText={(text) => {
            console.log('[DEBUG] mgPorComprimido:', text);
            setMgPorComprimido(text);
          }}
          keyboardType="numeric"
          placeholder="Mg por comprimido"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={mgPorDose}
          onChangeText={(text) => {
            console.log('[DEBUG] mgPorDose:', text);
            setMgPorDose(text);
          }}
          keyboardType="numeric"
          placeholder="Mg por dose"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '99' }}
          value={dosesPorDia}
          onChangeText={(text) => {
            console.log('[DEBUG] dosesPorDia:', text);
            setDosesPorDia(text);
          }}
          keyboardType="numeric"
          placeholder="Doses por dia"
          placeholderTextColor="#bbb"
        />

        <TextInputMask
          style={styles.input}
          type={'only-numbers'}
          options={{ mask: '9999' }}
          value={estoque}
          onChangeText={(text) => {
            console.log('[DEBUG] estoque:', text);
            setEstoque(text);
          }}
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
              onChangeText={(text) => handleHorarioChange(text, index)}
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

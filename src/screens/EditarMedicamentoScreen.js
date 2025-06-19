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
  Keyboard,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MedicationRepository from '../repositories/MedicationRepository';
import { TextInputMask } from 'react-native-masked-text';
import NotificationService from '../services/NotificationService'; // no topo do seu arquivo
import DateUtils from '../utils/DateUtils';
import AlertUtils from '../utils/AlertUtils';

// Obtendo as dimensões da tela
const { width, height } = Dimensions.get('window');

const EditarMedicamentoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { medicamento } = route.params;

  console.log('Medicamento recebido para edição:', medicamento);

  const [nome, setNome] = useState(medicamento?.nome || '');
  const [mgPorComprimido, setMgPorComprimido] = useState(medicamento?.mgPorComprimido || '');
  const [mgPorDose, setMgPorDose] = useState(medicamento?.mgPorDose || '');
  const [dosesPorDia, setDosesPorDia] = useState(medicamento?.dosesPorDia || '');
  const [estoque, setEstoque] = useState(medicamento?.estoque || '');
  const [horarios, setHorarios] = useState(medicamento?.horarios || ['']);
  const [dataCadastro, setDataCadastro] = useState(medicamento?.dataCadastro || '');

  const handleHorarioChange = (text, index) => {
    console.log(`Alterando horário no índice ${index}: ${text}`);
    const novosHorarios = [...horarios];
    novosHorarios[index] = text;
    setHorarios(novosHorarios);
  };

  const adicionarHorario = () => {
    console.log('Adicionando novo horário...');
    setHorarios([...horarios, '']);
  };

  const removerHorario = (index) => {
    console.log(`Removendo horário no índice ${index}...`);
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  const handleSalvar = async () => {
    console.log('[EditarMedicamentoScreen] Iniciando edição...');
    let dataCadastroFinal = dataCadastro || medicamento.dataCadastro;
    if (dataCadastroFinal && dataCadastroFinal.length <= 10) {
      dataCadastroFinal = new Date(dataCadastroFinal + 'T00:00:00.000Z').toISOString();
    }
    console.log('[EditarMedicamentoScreen] dataCadastroFinal:', dataCadastroFinal);

    const updatedMedication = {
      id: medicamento.id,
      nome,
      mgPorComprimido,
      mgPorDose,
      dosesPorDia,
      estoque,
      horarios,
      dataCadastro: dataCadastroFinal,
    };
    console.log('[EditarMedicamentoScreen] updatedMedication:', updatedMedication);

    const sucesso = await MedicationRepository.updateMedication(updatedMedication);
    console.log('[EditarMedicamentoScreen] sucesso update:', sucesso);

    if (sucesso) {
      try {
        console.log('[EditarMedicamentoScreen] Cancelando notificações antigas...');
        await NotificationService.cancelNotificationsByMedicationId(medicamento.id);
        console.log('[EditarMedicamentoScreen] Agendando novas notificações...');
        await NotificationService.scheduleMedicationNotifications({
          id: medicamento.id,
          nome,
          horarios,
        });
        console.log('[EditarMedicamentoScreen] Notificações agendadas com sucesso!');
        AlertUtils.showSuccess('Alterações salvas com sucesso!', 'Sucesso');
      } catch (error) {
        console.error('[EditarMedicamentoScreen] Erro ao atualizar notificações:', error);
        AlertUtils.showError('Erro ao atualizar as notificações.', 'Erro');
      }
    } else {
      console.error('[EditarMedicamentoScreen] Erro ao salvar as alterações.');
      AlertUtils.showError('Erro ao salvar as alterações.', 'Erro');
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Teclado mostrado');
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log('Teclado escondido');
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Nome do medicamento</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Nome do medicamento"
          placeholderTextColor="#bbb"
        />

        <Text style={styles.label}>Mg por comprimido</Text>
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

        <Text style={styles.label}>Mg por dose</Text>
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

        <Text style={styles.label}>Doses por dia</Text>
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

        <Text style={styles.label}>Estoque</Text>
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
          <Button title="Salvar alterações" onPress={handleSalvar} />
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
  label: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
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

export default EditarMedicamentoScreen;

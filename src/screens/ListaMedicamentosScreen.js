import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Modal, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';
import MedicationRepository from '../repositories/MedicationRepository';
import CalendarService from '../services/CalendarService';
import NotificationService from '../services/NotificationService';
import { useIsFocused } from '@react-navigation/native';
import MedicationUtils from '../utils/MedicationUtils';
import AlertUtils from '../utils/AlertUtils';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ListaMedicamentosScreen = ({ navigation }) => {
  const { user } = useUser();
  const [medicamentos, setMedicamentos] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingStep, setDeletingStep] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    const carregarDados = async () => {
      if (user) {
        const dados = await MedicationRepository.getMedicationsByUserId(user.id);
        const atualizados = MedicationUtils.atualizarEstoqueComDias(dados);
        setMedicamentos(atualizados);

        // Filtra medicamentos com estoque baixo (diasRestantes <= 10)
        const estoqueBaixoMedicamentos = atualizados.filter(
          (med) => parseFloat(med.diasRestantes) <= 10
        );

        if (estoqueBaixoMedicamentos.length > 0) {
          const nomes = estoqueBaixoMedicamentos.map((med) => `🔴 ${med.nome}`).join('\n');
          AlertUtils.showError(`Os seguintes medicamentos estão com estoque baixo:\n${nomes}`, 'Atenção');
        }
      }
    };

    if (isFocused) {
      carregarDados();
    }
  }, [isFocused, user]);

  const handleExcluir = (id) => {
    AlertUtils.showConfirm(
      'Deseja excluir este medicamento?',
      async () => {
        setIsDeleting(true);
        setDeletingStep('Preparando exclusão...');
        
        try {
          // Buscar medicamento antes de excluir para obter os IDs dos eventos
          const medicamento = medicamentos.find(m => m.id === id);
          const eventIds = medicamento?.calendarEventIds || [];

          // Remover eventos do calendário antes de excluir o medicamento (não bloqueia se falhar)
          if (eventIds && eventIds.length > 0) {
            try {
              setDeletingStep(`Removendo ${eventIds.length} evento(s) do calendário...`);
              console.log('[ListaMedicamentosScreen] Removendo eventos do calendário:', eventIds.length);
              await CalendarService.removeEvents(eventIds);
              setDeletingStep('Eventos do calendário removidos');
              // Pequeno delay para mostrar a mensagem
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (calendarError) {
              console.error('[ListaMedicamentosScreen] Erro ao remover eventos do calendário:', calendarError);
              setDeletingStep('Aviso: alguns eventos do calendário não puderam ser removidos');
              // Continua com a exclusão mesmo se falhar ao remover eventos
            }
          }

          // Cancelar notificações (não bloqueia se falhar)
          try {
            setDeletingStep('Cancelando notificações...');
            await NotificationService.cancelNotificationsByMedicationId(id);
            setDeletingStep('Notificações canceladas');
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (notificationError) {
            console.error('[ListaMedicamentosScreen] Erro ao cancelar notificações:', notificationError);
            setDeletingStep('Aviso: algumas notificações não puderam ser canceladas');
            // Continua com a exclusão mesmo se falhar ao cancelar notificações
          }

          // Excluir medicamento do banco de dados
          setDeletingStep('Excluindo medicamento do banco de dados...');
          const sucesso = await MedicationRepository.deleteMedication(id);
          
          if (sucesso) {
            setDeletingStep('Atualizando lista...');
            const atualizados = await MedicationRepository.getMedicationsByUserId(user.id);
            setMedicamentos(MedicationUtils.atualizarEstoqueComDias(atualizados));
            setDeletingStep('Concluído!');
            await new Promise(resolve => setTimeout(resolve, 500));
            AlertUtils.showSuccess('Medicamento excluído com sucesso!', 'Sucesso');
          } else {
            AlertUtils.showError('Não foi possível excluir o medicamento.', 'Erro');
          }
        } catch (error) {
          console.error('[ListaMedicamentosScreen] Erro geral ao excluir:', error);
          AlertUtils.showError('Ocorreu um erro ao excluir o medicamento.', 'Erro');
        } finally {
          setIsDeleting(false);
          setDeletingStep('');
        }
      },
      null,
      'Confirmação'
    );
  };

  // Função para compartilhar medicamentos do usuário logado
  const handleShareMedicamentos = async () => {
    try {
      const medicamentos = await MedicationRepository.getMedicationsByUserId(user.id);
      const alergias = user.alergias || [];
      let mensagem = '';
      if (alergias.length > 0) {
        mensagem += `Declaro, para os devidos fins, que sou alérgico(a) aos seguintes medicamentos ou substâncias: ${alergias.join(', ')}.\n\n`;
      } else {
        mensagem += 'Declaro, para os devidos fins, que não possuo alergias conhecidas.\n\n';
      }
      if (medicamentos.length > 0) {
        mensagem += 'Minha lista de medicamentos em uso atualmente é:\n';
        mensagem += medicamentos.map(med => `- ${med.nome}: Dose de ${med.mgPorDose} mg, quantidade de ${Math.ceil(med.mgPorDose / med.mgPorComprimido)} comprimido(s) por vez. Horários: ${Array.isArray(med.horarios) ? med.horarios.join(', ') : med.horarios}.`).join('\n');
      } else {
        mensagem += 'No momento, não faço uso de nenhum medicamento.';
      }
      await Share.open({
        message: `Minhas informações de saúde:\n\n${mensagem}`,
        title: 'Minhas Informações de Saúde',
        failOnCancel: false,
      });
    } catch (error) {
      AlertUtils.showError('Não foi possível compartilhar a lista.', 'Erro');
      console.error('[ListaMedicamentosScreen] Erro ao compartilhar:', error);
    }
  };

  const renderItem = ({ item }) => {
    const estoqueBaixo = parseFloat(item.diasRestantes) <= 10;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.nome}</Text>
        <Text style={styles.text}>Mg/Comprimido: {item.mgPorComprimido}mg</Text>
        <Text style={styles.text}>Mg/Dose: {item.mgPorDose}mg</Text>
        <Text style={styles.text}>Doses por dia: {item.dosesPorDia}</Text>
        <Text style={styles.text}>
          Estoque atual: {parseFloat(item.estoqueAtual).toLocaleString('pt-BR')}
        </Text>
        <Text style={[styles.text, estoqueBaixo && styles.estoqueBaixo]}>
          Dias restantes: {parseFloat(item.diasRestantes).toLocaleString('pt-BR')}
        </Text>
        <Text style={styles.text}>Dias desde o cadastro: {item.diasPassados}</Text>
        <Text style={styles.text}>Data de Cadastro: {item.dataCadastroFormatada}</Text>

        {estoqueBaixo && <Text style={styles.alerta}>⚠️ Estoque baixo! Considere repor.</Text>}

        <View style={styles.actions}>
          <Button title="Editar" onPress={() => navigation.navigate('EditarMedicamento', { medicamento: item })} />
          <View style={{ width: 10 }} />
          <Button title="Excluir" color="red" onPress={() => handleExcluir(item.id)} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        <Button title="Compartilhar Lista" onPress={handleShareMedicamentos} color="#1976D2" />
      </View>
      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum medicamento encontrado.</Text>}
      />
      
      {/* Modal de carregamento durante exclusão */}
      <Modal
        visible={isDeleting}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Não permite fechar durante a exclusão
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Icon name="delete" size={32} color="#ff4444" style={styles.deleteIcon} />
            <Text style={styles.loadingTitle}>Excluindo Medicamento</Text>
            <Text style={styles.loadingStep}>{deletingStep}</Text>
            <Text style={styles.loadingSubtext}>Por favor, aguarde...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#bbb',
  },
  estoqueBaixo: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  alerta: {
    color: '#ff4444',
    fontWeight: 'bold',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
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
  deleteIcon: {
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

export default ListaMedicamentosScreen;

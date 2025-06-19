import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';
import MedicationRepository from '../repositories/MedicationRepository';
import UserRepository from '../repositories/UserRepository';
import { useUser } from '../context/UserContext';
import DateUtils from '../utils/DateUtils';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../themes/DatabaseScreen.styles';

const { width } = Dimensions.get('window');

export default function DatabaseScreen() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const { user } = useUser();

  const fetchData = async () => {
    const data = await MedicationRepository.getAll();
    setMedicamentos(data);
    const users = await UserRepository.getAllUsers();
    setUsuarios(users);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const deleteMedication = async (id) => {
    try {
      await MedicationRepository.delete(id);
      setMedicamentos((prev) => prev.filter((med) => med.id !== id));
    } catch (error) {
      console.error('Erro ao deletar medicamento:', error);
    }
  };

  const deleteNullId = async (id) => {
    try {
      await MedicationRepository.deleteUserIdNull();
      setMedicamentos((prev) => prev.filter((med) => med.id !== id));
    } catch (error) {
      console.error('Erro ao deletar medicamentos com userId null:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Adiciona o zero à esquerda se necessário
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses começam do zero
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.id}</Text>
      <Text style={styles.tableCell}>{item.userId || 'Nenhum'}</Text>
      <Text style={styles.tableCell}>{item.nome}</Text>
      <Text style={styles.tableCell}>{item.mgPorComprimido}</Text>
      <Text style={styles.tableCell}>{item.mgPorDose}</Text>
      <Text style={styles.tableCell}>{item.dosesPorDia}</Text>
      <Text style={styles.tableCell}>{item.estoque}</Text>
      <Text style={styles.tableCell}>
        {item.dataCadastro ? DateUtils.formatDateBR(item.dataCadastro) : 'Sem data'}
      </Text>
      <Text style={styles.tableCell}>
        {DateUtils.safeParseHorarios(item.horarios).join(', ')}
      </Text>
      <View style={styles.tableCell}>
        {item.userId === null && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNullId(item.id)}
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Função para exportar, resetar e restaurar medicamentos
  const handleExportResetRestore = async () => {
    try {
      Alert.alert('Atenção', 'Este processo irá recriar a tabela de medicamentos. Deseja continuar?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            // 1. Exporta
            const meds = await MedicationRepository.exportarTodosMedicamentos();
            // 2. Deleta tabela
            await MedicationRepository.deletarTabelaMedicamentos();
            // 3. Recria tabela
            await MedicationRepository.criarTabelaMedicamentos();
            // 4. Restaura
            await MedicationRepository.inserirMedicamentosEmLote(meds);
            fetchData();
            Alert.alert('Sucesso', 'Medicamentos exportados, tabela recriada e dados restaurados!');
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao executar processo: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Central de Dados</Text>
      {user && user.id && (
        <Text style={styles.userInfo}>ID do Usuário: {user.id}</Text>
      )}

      {/* Tabela de usuários e alergias */}
      <Text style={[styles.header, {marginTop: 10}]}>Usuários e Alergias</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>ID</Text>
            <Text style={styles.tableHeaderText}>Nome de Usuário</Text>
            <Text style={styles.tableHeaderText}>Alergias</Text>
          </View>
          <ScrollView style={styles.scrollableBody}>
            {usuarios.map((u) => (
              <View key={u.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{u.id}</Text>
                <Text style={styles.tableCell}>{u.username}</Text>
                <Text style={styles.tableCell}>{(() => {
                  if (!u.alergias) return 'Nenhuma';
                  if (Array.isArray(u.alergias)) return u.alergias.length > 0 ? u.alergias.join(', ') : 'Nenhuma';
                  try {
                    const arr = JSON.parse(u.alergias);
                    return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : 'Nenhuma';
                  } catch {
                    return 'Nenhuma';
                  }
                })()}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>ID</Text>
            <Text style={styles.tableHeaderText}>ID Usuário</Text>
            <Text style={styles.tableHeaderText}>Nome</Text>
            <Text style={styles.tableHeaderText}>Mg/Comp</Text>
            <Text style={styles.tableHeaderText}>Mg/Dose</Text>
            <Text style={styles.tableHeaderText}>Doses/Dia</Text>
            <Text style={styles.tableHeaderText}>Estoque</Text>
            <Text style={styles.tableHeaderText}>Cadastro</Text>
            <Text style={styles.tableHeaderText}>Horários</Text>
            <Text style={styles.tableHeaderText}>Ação</Text>
          </View>

          <ScrollView style={styles.scrollableBody}>
            <FlatList
              data={medicamentos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false} // Desativa o scroll interno para não conflitar
            />
          </ScrollView>
        </View>
      </ScrollView>

      <Button title="Exportar, Resetar e Restaurar Medicamentos" onPress={handleExportResetRestore} color="#1976D2" />
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MedicationRepository from '../repositories/MedicationRepository';
import { useUser } from '../context/UserContext';

const { width } = Dimensions.get('window');

export default function DatabaseScreen() {
  const [medicamentos, setMedicamentos] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      const data = await MedicationRepository.getAll();
      setMedicamentos(data);
    };

    fetchData();
  }, []);

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
        {item.dataCadastro ? formatDate(item.dataCadastro) : 'Sem data'}
      </Text>
      <Text style={styles.tableCell}>
        {Array.isArray(item.horarios)
          ? item.horarios.join(', ')
          : typeof item.horarios === 'string'
          ? item.horarios
          : ''}
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medicamentos Salvos</Text>
      {user && user.id && (
        <Text style={styles.userInfo}>ID do Usuário: {user.id}</Text>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    color: 'white',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 8,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 90,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tableCell: {
    color: '#fff',
    textAlign: 'center',
    minWidth: 90,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#ff3333',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollableBody: {
    maxHeight: 400,
  },
});

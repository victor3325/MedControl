import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { useUser } from '../context/UserContext';
import UserRepository from '../repositories/UserRepository';
import MedicationRepository from '../repositories/MedicationRepository'; // Supondo que haja um repositório para medicamentos
import Icon from 'react-native-vector-icons/FontAwesome';
import Share from 'react-native-share';
import styles from '../themes/LoginScreen.styles';

export default function LoginScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Armazenando o usuário selecionado
  const { setUser } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const allUsers = await UserRepository.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  // Função para fazer login
  const handleLogin = (user) => {
    setUser(user); // Armazenando o usuário no contexto
    navigation.replace('MainTabs');
  };

  // Função para confirmar a exclusão de usuário
  const confirmDelete = (userId) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este usuário? Todos os dados de medicamentos vinculados a este perfil serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDelete(userId),
        },
      ]
    );
  };

  // Função para excluir o usuário
  const handleDelete = async (userId) => {
    try {
      // Primeiro, exclui os medicamentos vinculados ao usuário
      await MedicationRepository.deleteMedicationsByUserId(userId); // Método para excluir medicamentos de um usuário

      // Agora, exclui o usuário
      await UserRepository.deleteUser(userId);
      fetchUsers(); // Atualizar a lista de usuários após exclusão
    } catch (error) {
      console.error("Erro ao excluir usuário ou medicamentos:", error);
    }
  };

  // Função para compartilhar medicamentos de um usuário
  const handleShareMedicamentos = async (user) => {
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
        message: `Informações de saúde do usuário ${user.username}:\n\n${mensagem}`,
        title: `Informações de saúde de ${user.username}`,
        failOnCancel: false,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a lista.');
      console.error('[LoginScreen] Erro ao compartilhar:', error);
    }
  };

  // Função para renderizar cada item de usuário
  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <TouchableOpacity style={styles.userButton} onPress={() => handleLogin(item)}>
        <Text style={styles.userName}>{item.username}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shareButton} onPress={() => handleShareMedicamentos(item)}>
        <Icon name="share-alt" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha um perfil</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.buttonSpacing}>
        <Button title="Cadastrar novo usuário" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
}

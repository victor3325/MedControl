import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { useUser } from '../context/UserContext';
import UserRepository from '../repositories/UserRepository';
import MedicationRepository from '../repositories/MedicationRepository'; // Supondo que haja um repositório para medicamentos
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LoginScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [password, setPassword] = useState('');
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
    if (user && user.password === password) { // Verificando se a senha do usuário corresponde ao valor inserido
      setUser(user); // Armazenando o usuário no contexto
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Erro', 'Usuário ou senha inválidos.');
    }
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

  // Função para renderizar cada item de usuário
  const renderItem = ({ item }) => (
    <View style={styles.userButton}>
      <TouchableOpacity style={styles.userInfo} onPress={() => setSelectedUser(item)}>
        <Icon name="user-circle" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => confirmDelete(item.id)}>
        <Icon name="trash" size={22} color="#cc0000" />
      </TouchableOpacity>
    </View>
  );

  // Exibe o campo de senha após selecionar um usuário
  const renderPasswordInput = () => {
    if (!selectedUser) return null; // Se nenhum usuário for selecionado, não exibe nada

    return (
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Login" onPress={() => handleLogin(selectedUser)} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha um perfil</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Renderiza o campo de senha apenas se um usuário for selecionado */}
      {renderPasswordInput()}

      <View style={styles.buttonSpacing}>
        <Button title="Cadastrar novo usuário" onPress={() => navigation.navigate('Register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212', // Tema escuro
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff', // Texto claro
  },
  list: {
    paddingBottom: 20,
  },
  userButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333', // Fundo escuro para cada item
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    color: '#fff', // Texto claro
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff', // Texto da senha em branco
    backgroundColor: '#333', // Fundo escuro do campo de senha
  },
  passwordContainer: {
    marginTop: 20,
  },
  buttonSpacing: {
    marginTop: 20, // Adicionando espaço entre o botão de login e o de cadastro
  },
});

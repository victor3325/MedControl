import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity
} from 'react-native';
import { useUser } from '../context/UserContext';
import UserRepository from '../repositories/UserRepository';

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUpdate = async () => {
    console.log('Botão salvar clicado');

    // Flag para verificar se algo foi alterado
    let updatedPassword = user.password;  // Mantém a senha original se não for alterada
    let isUpdated = false; // Verifica se houve alguma alteração

    // Comparação case-insensitive para nome de usuário
    if (username.toLowerCase() !== user.username.toLowerCase()) {
      isUpdated = true;
    }

    // Verifica se a senha foi alterada
    if (password && password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    // Se a senha foi fornecida e alterada, atualiza a senha
    if (password) {
      updatedPassword = password;
      isUpdated = true;
    }

    // Se não houver alteração de nome nem de senha, exibe mensagem
    if (!isUpdated) {
      Alert.alert('Nada foi alterado', 'Nenhuma alteração foi feita no perfil.');
      return;
    }

    console.log('Tentando atualizar com:', { id: user.id, username, updatedPassword });

    // Tenta atualizar os dados do usuário
    const success = await UserRepository.updateUser(user.id, username, updatedPassword);
    console.log('Sucesso?', success);

    if (success) {
      const updatedUser = { ...user, username, password: updatedPassword };
      setUser(updatedUser); // Atualiza o contexto
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja excluir esse perfil? Todos os dados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const deleted = await UserRepository.deleteUser(user.id);
            if (deleted) {
              setUser(null); // Limpa o usuário do contexto
              navigation.replace('Login'); // Redireciona para a tela de login
            } else {
              Alert.alert('Erro', 'Não foi possível excluir o perfil.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome de usuário</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Nova senha</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />

      <Text style={styles.label}>Confirmar nova senha</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
      />

      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Text style={styles.togglePassword}>
          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        </Text>
      </TouchableOpacity>

      <Button title="Salvar alterações" onPress={handleUpdate} color="#4CAF50" />
      <View style={{ height: 10 }} />
      <Button title="Excluir perfil" onPress={handleDelete} color="#E53935" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro
  },
  label: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff', // Texto claro
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
    backgroundColor: '#333', // Fundo escuro para os inputs
    color: '#fff', // Texto claro nos inputs
  },
  togglePassword: {
    color: '#007BFF',
    marginVertical: 10,
    textAlign: 'right',
  },
});

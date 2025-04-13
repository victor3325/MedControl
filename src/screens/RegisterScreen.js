import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import UserRepository from '../repositories/UserRepository';
import { useUser } from '../context/UserContext';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Clicou no botão de cadastrar');

      if (!username || !password) {
        console.log('⚠️ Campos obrigatórios não preenchidos');
        throw new Error('Preencha todos os campos.');
      }

      console.log('🔍 Verificando se o usuário já existe...');
      const existing = await UserRepository.getUserByUsername(username);
      if (existing) {
        console.log('⚠️ Usuário já existe');
        throw new Error('Usuário já existe.');
      }

      console.log('✔️ Criando o novo usuário...');
      const userId = await UserRepository.createUser(username, password);
      if (userId) {
        console.log('🎉 Usuário criado com sucesso');
        const user = await UserRepository.getUserById(userId);
        setUser(user);
        Alert.alert('Cadastro realizado!', `Bem-vindo, ${username}!`);
        setUsername('');
        setPassword('');
        navigation.replace('MainTabs');
      } else {
        console.log('❌ Erro ao criar o usuário');
        throw new Error('Não foi possível criar o usuário.');
      }

    } catch (error) {
      console.log('💥 Erro: ', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        editable={!isLoading}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
        placeholderTextColor="#888"
      />

      <Button
        title={isLoading ? 'Cadastrando...' : 'Cadastrar'}
        onPress={handleRegister}
        disabled={isLoading}
      />

      {/* Espaço entre os botões */}
      <View style={styles.buttonSpacing} />

      <Button title="Voltar" onPress={() => navigation.goBack()} disabled={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#333',
    color: '#fff',
  },
  buttonSpacing: {
    marginBottom: 10, // Adicionando o espaço entre os botões
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import UserRepository from '../repositories/UserRepository';
import { useUser } from '../context/UserContext';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState([]);

  const handleAddAlergia = () => {
    if (alergiaInput.trim() && !alergias.includes(alergiaInput.trim())) {
      setAlergias([...alergias, alergiaInput.trim()]);
      setAlergiaInput('');
    }
  };

  const handleRemoveAlergia = (alergia) => {
    setAlergias(alergias.filter(a => a !== alergia));
  };

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Clicou no botão de cadastrar');

      if (!username) {
        console.log('⚠️ Campo obrigatório não preenchido');
        throw new Error('Preencha o nome de usuário.');
      }

      console.log('🔍 Verificando se o usuário já existe...');
      const existing = await UserRepository.getUserByUsername(username);
      if (existing) {
        console.log('⚠️ Usuário já existe');
        throw new Error('Usuário já existe.');
      }

      console.log('✔️ Criando o novo usuário...');
      const userId = await UserRepository.createUser(username, alergias);
      if (userId) {
        console.log('🎉 Usuário criado com sucesso');
        const user = await UserRepository.getUserById(userId);
        setUser(user);
        Alert.alert('Cadastro realizado!', `Bem-vindo, ${username}!`);
        setUsername('');
        setAlergias([]);
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

      {/* Campo de alergias */}
      <Text style={{ color: '#fff', marginBottom: 5, marginTop: 10 }}>Sou alérgico(a) a:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Digite uma alergia"
          value={alergiaInput}
          onChangeText={setAlergiaInput}
          editable={!isLoading}
          placeholderTextColor="#888"
        />
        <Button title="Adicionar" onPress={handleAddAlergia} disabled={!alergiaInput.trim() || isLoading} />
      </View>
      {alergias.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          {alergias.map((alergia, idx) => (
            <View key={alergia + idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#fff', flex: 1 }}>• {alergia}</Text>
              <TouchableOpacity onPress={() => handleRemoveAlergia(alergia)}>
                <Text style={{ color: '#E53935', marginLeft: 8 }}>Remover</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

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

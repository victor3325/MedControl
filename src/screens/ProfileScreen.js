import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, TouchableOpacity
} from 'react-native';
import { useUser } from '../context/UserContext';
import UserRepository from '../repositories/UserRepository';
import styles from '../themes/ProfileScreen.styles';

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useUser();
  const [username, setUsername] = useState('');
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState([]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAlergias(user.alergias || []);
    }
  }, [user]);

  const handleAddAlergia = () => {
    if (alergiaInput.trim() && !alergias.includes(alergiaInput.trim())) {
      setAlergias([...alergias, alergiaInput.trim()]);
      setAlergiaInput('');
    }
  };

  const handleRemoveAlergia = (alergia) => {
    setAlergias(alergias.filter(a => a !== alergia));
  };

  const handleUpdate = async () => {
    // Atualiza apenas username
    let isUpdated = false;
    if (username.toLowerCase() !== user.username.toLowerCase()) {
      isUpdated = true;
    }
    if (!isUpdated) {
      Alert.alert('Nada foi alterado', 'Nenhuma alteração foi feita no perfil.');
      return;
    }
    const success = await UserRepository.updateUser(user.id, username, user.alergias);
    if (success) {
      const updatedUser = { ...user, username };
      setUser(updatedUser);
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
      <Text style={styles.label}>Meu Perfil</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Button title="Salvar alterações" onPress={handleUpdate} color="#4CAF50" />
      <View style={{ height: 10 }} />
      <Button title="Excluir perfil" onPress={handleDelete} color="#E53935" />
    </View>
  );
}

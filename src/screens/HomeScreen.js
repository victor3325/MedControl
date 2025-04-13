import React from 'react';
import {
  View, Text, Button, StyleSheet
} from 'react-native';
import { useUser } from '../context/UserContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {user ? (
          <Text style={styles.welcomeText}>Bem-vindo, {user.username}!</Text>
        ) : (
          <Text style={styles.welcomeText}>Carregando usuário...</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Criar Medicamento"
          onPress={() => navigation.navigate('CadastroMedicamento')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Listar Medicamentos"
          onPress={() => navigation.navigate('ListaMedicamentos')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  welcomeContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  buttonContainer: {
    marginVertical: 5,
  },
});

export default HomeScreen;

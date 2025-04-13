import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Armazenar o usuário no estado

  // Função para carregar o usuário do AsyncStorage
  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Parse para JSON
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do AsyncStorage', error);
    }
  };

  useEffect(() => {
    loadUserFromStorage(); // Carregar usuário do AsyncStorage ao iniciar o app
  }, []);

  // Função para salvar o usuário no AsyncStorage e no estado
  const saveUserToStorage = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData); // Atualiza o estado local
    } catch (error) {
      console.error('Erro ao salvar usuário no AsyncStorage', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: saveUserToStorage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

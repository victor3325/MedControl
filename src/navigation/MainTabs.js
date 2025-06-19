import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUser } from '../context/UserContext';
import HomeStackNavigator from '../navigation/HomeStackNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import DatabaseScreen from '../screens/DatabaseScreen'; // Import da nova tela
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SupportScreen from '../screens/SupportScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs({ navigation }) {
  const { user, setUser } = useUser();

  const handleLogout = () => {
    setUser(null);
    navigation.navigate('Login');
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Banco de Dados') {
            iconName = focused ? 'server' : 'server-outline';
          } else if (route.name === 'Suporte') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen
        name="Início"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        initialParams={{ userId: 1 }}
        options={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
          headerTitle: () => null,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Banco de Dados"
        component={DatabaseScreen}
        options={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
        }}
      />

      <Tab.Screen
        name="Suporte"
        component={SupportScreen}
        options={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#fff',
          tabBarIcon: ({ color, size }) => (
            <Icon name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#E53935',
    borderRadius: 5,
    marginRight: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

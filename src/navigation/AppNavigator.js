import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import CadastroMedicamentoScreen from '../screens/CadastroMedicamentoScreen';
import EditarMedicamentoScreen from '../screens/EditarMedicamentoScreen';
import TestNotificationScreen from '../screens/TestNotificationScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="CadastroMedicamento" component={CadastroMedicamentoScreen} />
        <Stack.Screen name="EditarMedicamento" component={EditarMedicamentoScreen} />
        <Stack.Screen name="TestNotification" component={TestNotificationScreen} />
      </Stack.Navigator>
  );
}

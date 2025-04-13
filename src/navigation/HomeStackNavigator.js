import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CadastroMedicamentoScreen from '../screens/CadastroMedicamentoScreen';
import EditarMedicamentoScreen from '../screens/EditarMedicamentoScreen';
import ListaMedicamentosScreen from '../screens/ListaMedicamentosScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Stack.Screen name="CadastroMedicamento" component={CadastroMedicamentoScreen} options={{ title: 'Novo Medicamento' }} />
      <Stack.Screen name="EditarMedicamento" component={EditarMedicamentoScreen} options={{ title: 'Editar Medicamento' }} />
      <Stack.Screen
        name="ListaMedicamentos"
        component={ListaMedicamentosScreen}
        options={{ title: 'Meus Medicamentos' }}
      />
    </Stack.Navigator>
  );
}

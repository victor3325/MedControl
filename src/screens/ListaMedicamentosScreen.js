import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { useUser } from '../context/UserContext';
import MedicationRepository from '../repositories/MedicationRepository';
import { useIsFocused } from '@react-navigation/native';

const ListaMedicamentosScreen = ({ navigation }) => {
  const { user } = useUser();
  const [medicamentos, setMedicamentos] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const carregarDados = async () => {
      if (user) {
        const dados = await MedicationRepository.getMedicationsByUserId(user.id);
        setMedicamentos(atualizarEstoqueComDias(dados));
      }
    };

    if (isFocused) {
      carregarDados();
    }
  }, [isFocused, user]);

  const atualizarEstoqueComDias = (lista) => {
    return lista.map((med) => {
      const mgPorComprimido = parseFloat(med.mgPorComprimido) || 0;
      const mgPorDose = parseFloat(med.mgPorDose) || 0;
      const dosesPorDia = parseInt(med.dosesPorDia, 10) || 0;
      const estoque = parseFloat(med.estoque) || 0;

      const dataCadastro = new Date(med.dataCadastro);
      if (isNaN(dataCadastro.getTime())) {
        console.error('Data de cadastro inválida:', med.dataCadastro, med);
        return {
          ...med,
          estoqueAtual: '0.00',
          diasRestantes: '0.00',
          diasPassados: 0,
          dataCadastroFormatada: 'Data inválida'
        };
      }

      const hoje = new Date();
      const umDiaEmMs = 1000 * 60 * 60 * 24;
      const diasPassados = Math.floor((hoje - dataCadastro) / umDiaEmMs);
      const dosesConsumidas = diasPassados * dosesPorDia;

      // Verifica se há risco de divisão por zero
      const fatorConversao = mgPorComprimido > 0 && mgPorDose > 0
        ? mgPorComprimido / mgPorDose
        : 0;

      const comprimidosConsumidos = fatorConversao > 0
        ? dosesConsumidas / fatorConversao
        : 0;

      const estoqueAtual = Math.max(estoque - comprimidosConsumidos, 0);

      const comprimidosPorDia = fatorConversao > 0
        ? dosesPorDia / fatorConversao
        : 0;

      const diasRestantes = comprimidosPorDia > 0
        ? estoqueAtual / comprimidosPorDia
        : 0;

      return {
        ...med,
        estoqueAtual: estoqueAtual.toFixed(2),
        diasRestantes: diasRestantes.toFixed(2),
        diasPassados: diasPassados,
        dataCadastroFormatada: dataCadastro.toLocaleDateString('pt-BR'),
      };
    });
  };

  const handleExcluir = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este medicamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim',
        onPress: async () => {
          const sucesso = await MedicationRepository.deleteMedication(id);
          if (sucesso) {
            const atualizados = await MedicationRepository.getMedicationsByUserId(user.id);
            setMedicamentos(atualizarEstoqueComDias(atualizados));
          } else {
            Alert.alert('Erro', 'Não foi possível excluir o medicamento.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.nome}</Text>
      <Text style={styles.text}>Mg/Comprimido: {item.mgPorComprimido}mg</Text>
      <Text style={styles.text}>Mg/Dose: {item.mgPorDose}mg</Text>
      <Text style={styles.text}>Doses por dia: {item.dosesPorDia}</Text>
      <Text style={styles.text}>Estoque atual: {parseFloat(item.estoqueAtual).toLocaleString('pt-BR')}</Text>
      <Text style={styles.text}>Dias restantes: {parseFloat(item.diasRestantes).toLocaleString('pt-BR')}</Text>
      <Text style={styles.text}>Dias desde o cadastro: {item.diasPassados}</Text>
      <Text style={styles.text}>Data de Cadastro: {item.dataCadastroFormatada}</Text>

      <View style={styles.actions}>
        <Button title="Editar" onPress={() => navigation.navigate('EditarMedicamento', { medicamento: item })} />
        <View style={{ width: 10 }} />
        <Button title="Excluir" color="red" onPress={() => handleExcluir(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medicamentos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum medicamento encontrado.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#bbb',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default ListaMedicamentosScreen;

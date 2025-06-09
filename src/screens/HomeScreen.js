import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';

import Share from 'react-native-share';  // <--- Import do react-native-share
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // import do ícone
import { useUser } from '../context/UserContext';
import MedicationRepository from '../repositories/MedicationRepository';
import { useFocusEffect } from '@react-navigation/native';

const safeParseHorarios = (horarios) => {
  if (!horarios) return [];
  if (Array.isArray(horarios)) return horarios;
  if (typeof horarios === 'object') return Object.values(horarios);
  if (typeof horarios === 'string') {
    try {
      return JSON.parse(horarios);
    } catch (e) {
      if (horarios.includes(',')) {
        return horarios.split(',').map(h => h.trim());
      }
      console.warn('JSON inválido para horários:', horarios, e);
      return [];
    }
  }
  return [];
};

const calcularQuantidade = (med) => {
  if (!med.mgPorDose || !med.mgPorComprimido) return 0;
  return Math.ceil(med.mgPorDose / med.mgPorComprimido);
};

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [proximosMedicamentos, setProximosMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchMedicamentos = async () => {
        if (!user?.id) {
          console.log('[fetchMedicamentos] Usuário não definido ou sem id');
          return;
        }

        setLoading(true);
        try {
          const meds = await MedicationRepository.getProximosMedicamentos(user.id);
          meds.forEach(med => console.log('Horários crus:', med.horarios));

          const medsComHorariosParseados = meds.map(med => ({
            ...med,
            horarios: safeParseHorarios(med.horarios),
          }));

          const now = new Date();
          const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

          const filtrados = medsComHorariosParseados.filter(med => {
            return med.horarios.some(horario => {
              if (!horario.includes(':')) return false;
              const [hh, mm] = horario.split(':').map(Number);
              const horarioDate = new Date(now);
              horarioDate.setHours(hh, mm, 0, 0);
              return horarioDate >= now && horarioDate <= sixHoursLater;
            });
          });

          setProximosMedicamentos(filtrados);
        } catch (error) {
          console.error('[fetchMedicamentos] Erro ao buscar medicamentos:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMedicamentos();
    }, [user])
  );

  const exportarLista = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Usuário não definido.');
      return;
    }

    setLoading(true);
    try {
      const todosMedicamentos = await MedicationRepository.getMedicationsByUserId(user.id);

      if (todosMedicamentos.length === 0) {
        Alert.alert('Lista vazia', 'Não há medicamentos para exportar.');
        setLoading(false);
        return;
      }

      const medsParseados = todosMedicamentos.map(med => ({
        ...med,
        horarios: safeParseHorarios(med.horarios),
      }));

      const mensagem = medsParseados
        .map(med => {
          const quantidade = calcularQuantidade(med);
          return `• ${med.nome}\n  Dose: ${med.mgPorDose} mg\n  Quantidade: ${quantidade} comprimidos\n  Horários: ${med.horarios.join(', ')}`;
        })
        .join('\n\n');

      const shareOptions = {
        message: `Meus medicamentos cadastrados:\n\n${mensagem}`,
        title: 'Lista Completa de Medicamentos',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a lista.');
      console.error('Erro ao compartilhar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {user ? (
          <Text style={styles.welcomeText}>Bem-vindo, {user.username}!</Text>
        ) : (
          <Text style={styles.welcomeText}>Carregando usuário...</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : proximosMedicamentos.length > 0 ? (
        <View style={styles.listaContainer}>
          <Text style={styles.listaTitulo}>Próximos Medicamentos (em até 6h)</Text>
          <ScrollView style={styles.scrollArea}>
            {proximosMedicamentos.map(item => {
              const quantidade = calcularQuantidade(item);
              return (
                <View key={item.id} style={styles.medicamentoItem}>
                  <Text style={styles.medicamentoNome}>{item.nome}</Text>
                  <Text style={styles.medicamentoDetalhes}>
                    Dose: {item.mgPorDose} mg - Quantidade: {quantidade} comprimidos
                  </Text>
                  <Text style={styles.medicamentoHorario}>
                    Horários: {item.horarios.join(', ')}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.buttonExportContainer}>
            <TouchableOpacity
              onPress={exportarLista}
              style={styles.exportButton}
              activeOpacity={0.7}
            >
              <Icon name="share-variant" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.semMedicamentos}>Nenhum medicamento próximo encontrado.</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CadastroMedicamento')}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Criar Medicamento</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ListaMedicamentos')}
          style={styles.navButton}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonText}>Listar Medicamentos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#121212',
  },
  welcomeContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listaContainer: {
    flex: 1,
    marginBottom: 20,
  },
  listaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 300,
  },
  medicamentoItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  medicamentoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  medicamentoDetalhes: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  medicamentoHorario: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
    fontStyle: 'italic',
  },
  semMedicamentos: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 5,
  },
  buttonExportContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  exportButton: {
    backgroundColor: '#4CAF50', // verde bonito
    padding: 14,
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  navButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

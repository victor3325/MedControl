import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  TextInput,
} from 'react-native';

import Share from 'react-native-share';  // <--- Import do react-native-share
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // import do ícone
import { useUser } from '../context/UserContext';
import MedicationRepository from '../repositories/MedicationRepository';
import { useFocusEffect } from '@react-navigation/native';
import DateUtils from '../utils/DateUtils';
import MedicationUtils from '../utils/MedicationUtils';
import AlertUtils from '../utils/AlertUtils';
import UserRepository from '../repositories/UserRepository';
import styles from '../themes/HomeScreen.styles';

const HomeScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [proximosMedicamentos, setProximosMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alergiaInput, setAlergiaInput] = useState('');
  const [alergias, setAlergias] = useState(user?.alergias || []);

  // Atualiza alergias do contexto se usuário mudar
  React.useEffect(() => {
    setAlergias(user?.alergias || []);
  }, [user]);

  const handleAddAlergia = async () => {
    if (alergiaInput.trim() && !alergias.includes(alergiaInput.trim())) {
      const novasAlergias = [...alergias, alergiaInput.trim()];
      setAlergias(novasAlergias);
      setAlergiaInput('');
      // Atualiza no banco e contexto
      if (user) {
        await UserRepository.updateUser(user.id, user.username, novasAlergias);
        setUser({ ...user, alergias: novasAlergias });
      }
    }
  };

  const handleRemoveAlergia = async (alergia) => {
    const novasAlergias = alergias.filter(a => a !== alergia);
    setAlergias(novasAlergias);
    if (user) {
      await UserRepository.updateUser(user.id, user.username, novasAlergias);
      setUser({ ...user, alergias: novasAlergias });
    }
  };

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
            horarios: DateUtils.safeParseHorarios(med.horarios),
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

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        {user ? (
          <Text style={styles.welcomeText}>Bem-vindo, {user.username}!</Text>
        ) : (
          <Text style={styles.welcomeText}>Carregando usuário...</Text>
        )}
      </View>

      {/* Campo de alergias */}
      <Text style={{ color: '#fff', marginBottom: 5, marginTop: 10 }}>Sou alérgico(a) a:</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Digite uma alergia"
          value={alergiaInput}
          onChangeText={setAlergiaInput}
          placeholderTextColor="#888"
        />
        <Button title="Adicionar" onPress={handleAddAlergia} disabled={!alergiaInput.trim()} />
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

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : proximosMedicamentos.length > 0 ? (
        <View style={styles.listaContainer}>
          <Text style={styles.listaTitulo}>Próximos Medicamentos (em até 6h)</Text>
          <ScrollView style={styles.scrollArea}>
            {proximosMedicamentos.map(item => {
              const quantidade = MedicationUtils.calcularQuantidade(item);
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

export default HomeScreen;

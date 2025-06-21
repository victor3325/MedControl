import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import AppTheme from '../themes/AppTheme';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

function gerarProtocolo() {
  const now = new Date();
  return 'MC-' + now.getFullYear().toString().slice(-2) + (now.getMonth()+1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0') + '-' + now.getTime().toString().slice(-5);
}

export default function SupportScreen() {
  const [descricao, setDescricao] = useState('');
  const [protocolo, setProtocolo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [telefone, setTelefone] = useState('');
  const [infoDispositivo, setInfoDispositivo] = useState('');
  const [ticketJira, setTicketJira] = useState(null);

  function formatarTelefone(valor) {
    // Remove tudo que não for número
    let num = valor.replace(/\D/g, '');
    // Limita a 11 dígitos
    num = num.slice(0, 11);
    // Formata (99) 99999-9999
    if (num.length <= 2) return num;
    if (num.length <= 7) return `(${num.slice(0,2)}) ${num.slice(2)}`;
    return `(${num.slice(0,2)}) ${num.slice(2,7)}-${num.slice(7)}`;
  }

  function handleTelefoneChange(valor) {
    const num = valor.replace(/\D/g, '').slice(0, 11);
    setTelefone(formatarTelefone(num));
  }

  const handleAbrirTicket = async () => {
    console.log('--- Botão "Enviar Ticket" pressionado ---');
    console.log(`Verificando Descrição: "${descricao}"`);
    console.log(`Verificando Telefone: "${telefone}" (dígitos: ${telefone.replace(/\D/g, '').length})`);

    if (!descricao.trim() || telefone.replace(/\D/g, '').length !== 11) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios corretamente. O telefone deve ter 11 dígitos.');
      return;
    }
    setEnviando(true);
    setEnviado(false);
    setTicketJira(null);
    let timeoutId = setTimeout(() => {
      setEnviando(false);
      Alert.alert('Erro', 'Tempo de conexão esgotado. Tente novamente mais tarde.');
    }, 12000); // 12 segundos de segurança
    // Coleta informações do dispositivo
    let marca = DeviceInfo.getBrand() || 'Desconhecida';
    let modelo = DeviceInfo.getModel() || 'Desconhecido';
    let versao = DeviceInfo.getSystemVersion() || 'Desconhecida';
    const info = `Dispositivo: ${marca} ${modelo}\nAndroid: ${versao}`;
    setInfoDispositivo(info);

    console.log('--- Validação OK. INICIANDO REQUISIÇÃO PARA O BACKEND ---');
    console.log('URL de destino:', 'https://medcontrol-tickets-vkx-d.vercel.app/api/tickets');

    try {
      const response = await axios.post('https://medcontrol-tickets-vkx-d.vercel.app/api/tickets', {
        summary: `Ticket de suporte - ${telefone}`,
        description: `Descrição: ${descricao}\nTelefone: ${telefone}\nDispositivo: ${marca} ${modelo}, Android ${versao}`
      }, {
        timeout: 10000 // 10 segundos
      });
      clearTimeout(timeoutId);
      if (response.data && response.data.jira && response.data.jira.key) {
        setTicketJira(response.data.jira.key);
        setEnviado(true);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o ticket no suporte.');
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Tratamento de Erros Detalhado
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Erro de Conexão', 'O tempo de resposta do servidor esgotou. Por favor, tente novamente mais tarde.');
      } else if (error.response) {
        // O servidor respondeu com um status de erro (ex: 400, 500)
        console.error('Erro do Servidor:', JSON.stringify(error.response.data, null, 2));
        const details = error.response.data.details;
        if (details && details.errorMessages && details.errorMessages.length > 0) {
          Alert.alert('Erro ao criar Ticket', `O suporte retornou um erro: ${details.errorMessages.join(', ')}`);
        } else {
          Alert.alert('Erro no Servidor', 'Ocorreu um problema ao processar sua solicitação. Tente novamente.');
        }
      } else {
        // Erro de rede ou outro problema
        console.error('Erro de Rede ou Genérico:', error.message);
        Alert.alert('Falha na Conexão', 'Não foi possível conectar ao servidor de suporte. Verifique sua internet e tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Suporte</Text>
      <Text style={styles.text}>
        Precisa de ajuda ou encontrou algum problema? Entre em contato com nosso suporte:
      </Text>
      <Text style={styles.label}>E-mail:</Text>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:medcontrol.contato@gmail.com')}>
        <Text style={styles.link}>medcontrol.contato@gmail.com</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Telefone/WhatsApp:</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/5547996995432')}>
        <Text style={styles.link}>+55 47 99699-5432</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Responsável:</Text>
      <Text style={styles.text}>Falar com Victor</Text>
      <Text style={styles.text}>
        Nosso time está disponível de segunda a sexta, das 8h às 18h.
      </Text>
      <Text style={styles.title}>Abrir Ticket de Suporte</Text>
      <Text style={styles.text}>Descreva o problema encontrado abaixo. Nossa equipe irá retornar o mais breve possível.</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Descrição do erro ou dúvida:</Text>
        <TextInput
          style={styles.input}
          placeholder="Descreva o problema com detalhes..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />
        <Text style={styles.label}>Telefone do WhatsApp para retorno:</Text>
        <TextInput
          style={styles.input}
          placeholder="(99) 99999-9999"
          value={telefone}
          onChangeText={handleTelefoneChange}
          keyboardType="phone-pad"
          maxLength={16}
        />
        <TouchableOpacity
          style={[styles.button, enviando && { backgroundColor: '#ccc' }]}
          onPress={handleAbrirTicket}
          disabled={enviando || !descricao.trim() || telefone.replace(/\D/g, '').length !== 11}
        >
          <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Enviar Ticket'}</Text>
        </TouchableOpacity>
        {enviado && ticketJira && (
          <View style={styles.protocoloBox}>
            <Text style={styles.protocoloText}>Ticket registrado no suporte: <Text style={{fontWeight:'bold'}}>{ticketJira}</Text></Text>
            <Text style={styles.text}>{infoDispositivo}</Text>
            <Text style={styles.text}>Você receberá um retorno em breve por WhatsApp.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppTheme.colors.background,
    padding: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: AppTheme.colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppTheme.colors.secondary,
    marginTop: 12,
  },
  link: {
    fontSize: 16,
    color: AppTheme.colors.link,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: AppTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  protocoloBox: {
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  protocoloText: {
    color: AppTheme.colors.secondary,
    fontSize: 16,
    marginBottom: 4,
  },
}); 
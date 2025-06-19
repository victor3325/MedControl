import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, TextInput } from 'react-native';
import AppTheme from '../themes/AppTheme';

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

  const handleAbrirTicket = async () => {
    if (!descricao.trim() || !telefone.trim()) return;
    setEnviando(true);
    const protocoloGerado = gerarProtocolo();
    setProtocolo(protocoloGerado);
    // Apenas WhatsApp
    const msg = encodeURIComponent(`Olá, preciso de suporte.\n\nDescrição: ${descricao}\nTelefone para retorno: ${telefone}\nProtocolo: ${protocoloGerado}`);
    Linking.openURL(`https://wa.me/5547996995432?text=${msg}`);
    setEnviando(false);
    setEnviado(true);
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
      <Text style={styles.label}>Documentação:</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://medcontrol.com/ajuda')}>
        <Text style={styles.link}>https://medcontrol.com/ajuda</Text>
      </TouchableOpacity>
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
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          maxLength={20}
        />
        <TouchableOpacity
          style={[styles.button, enviando && { backgroundColor: '#ccc' }]}
          onPress={handleAbrirTicket}
          disabled={enviando || !descricao.trim() || !telefone.trim()}
        >
          <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Enviar Ticket'}</Text>
        </TouchableOpacity>
        {enviado && protocolo && (
          <View style={styles.protocoloBox}>
            <Text style={styles.protocoloText}>Ticket enviado! Protocolo: <Text style={{fontWeight:'bold'}}>{protocolo}</Text></Text>
            <Text style={styles.text}>Você receberá um retorno em breve por e-mail ou WhatsApp.</Text>
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
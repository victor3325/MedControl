import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import AppTheme from '../themes/AppTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SupportScreen() {

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name="help-circle" size={48} color={AppTheme.colors.primary} />
        <Text style={styles.title}>Suporte</Text>
      </View>

      <Text style={styles.subtitle}>
        Precisa de ajuda ou encontrou algum problema? Entre em contato conosco:
      </Text>

      <View style={styles.contactCard}>
        <View style={styles.contactItem}>
          <Icon name="email" size={24} color={AppTheme.colors.primary} style={styles.icon} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>E-mail</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:medcontrol.contato@gmail.com')}>
              <Text style={styles.contactValue}>medcontrol.contato@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Icon name="whatsapp" size={24} color="#25D366" style={styles.icon} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/5547996995432')}>
              <Text style={styles.contactValue}>+55 47 99699-5432</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contactItem}>
          <Icon name="account" size={24} color={AppTheme.colors.primary} style={styles.icon} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Responsável</Text>
            <Text style={styles.contactValue}>Victor</Text>
          </View>
        </View>
      </View>

      <View style={styles.hoursCard}>
        <Icon name="clock-outline" size={24} color={AppTheme.colors.secondary} style={styles.icon} />
        <View style={styles.hoursInfo}>
          <Text style={styles.hoursLabel}>Horário de Atendimento</Text>
          <Text style={styles.hoursText}>Segunda a Sexta</Text>
          <Text style={styles.hoursText}>8h às 18h</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        Nossa equipe está pronta para ajudar você!
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: AppTheme.colors.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppTheme.colors.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: AppTheme.colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  contactCard: {
    backgroundColor: AppTheme.colors.card || '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary || '#999',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: AppTheme.colors.link || '#4CAF50',
    fontWeight: '500',
  },
  hoursCard: {
    backgroundColor: AppTheme.colors.card || '#1F1F1F',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hoursInfo: {
    flex: 1,
  },
  hoursLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppTheme.colors.secondary,
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 16,
    color: AppTheme.colors.text,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary || '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
}); 
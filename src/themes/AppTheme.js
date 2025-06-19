// Tema base para o app MedControl - visual leve, saúde/pacífico
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const colors = {
  background: '#F5FAFF', // azul bem claro
  card: '#E3F2FD', // azul claro
  primary: '#4FC3F7', // azul saúde
  accent: '#81C784', // verde saúde
  error: '#E57373',
  warning: '#FFD54F',
  text: '#222',
  textSecondary: '#4F5B62',
  textMuted: '#90A4AE',
  border: '#B0BEC5',
  inputBackground: '#fff',
  inputBorder: '#B0BEC5',
  button: '#4FC3F7',
  buttonText: '#fff',
  delete: '#E57373',
};

const fontSizes = {
  title: width > 400 ? 28 : 22,
  subtitle: width > 400 ? 20 : 16,
  text: width > 400 ? 16 : 14,
  small: width > 400 ? 14 : 12,
  tiny: 11,
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
};

const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 40,
};

export default {
  colors,
  fontSizes,
  spacing,
  borderRadius,
}; 
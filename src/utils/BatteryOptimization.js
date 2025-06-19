import { NativeModules, Platform } from 'react-native';

const { BatteryOptimization } = NativeModules;

export const checkBatteryOptimization = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'android' || !BatteryOptimization) {
      resolve(true); // iOS ou módulo não disponível: ignora otimização
      return;
    }
    try {
      BatteryOptimization.isIgnoringBatteryOptimizations((result) => {
        resolve(!!result); // força booleano
      });
    } catch (e) {
      console.warn('Erro ao checar otimização de bateria:', e);
      resolve(true); // fallback seguro
    }
  });
};

export const openBatterySettings = () => {
  if (Platform.OS === 'android' && BatteryOptimization) {
    try {
      BatteryOptimization.openBatteryOptimizationSettings();
    } catch (e) {
      console.warn('Erro ao abrir configurações de otimização de bateria:', e);
    }
  }
};

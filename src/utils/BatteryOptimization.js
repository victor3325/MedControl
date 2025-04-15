import { NativeModules } from 'react-native';

const { BatteryOptimization } = NativeModules;

export const checkBatteryOptimization = () => {
  return new Promise((resolve) => {
    BatteryOptimization.isIgnoringBatteryOptimizations((result) => {
      resolve(result); // true = está ignorando otimizações (bom)
    });
  });
};

export const openBatterySettings = () => {
  BatteryOptimization.openBatteryOptimizationSettings();
};

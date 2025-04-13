import UserRepository from '../repositories/UserRepository';
//import MedicationRepository from '../repositories/MedicationRepository';

export const initDatabase = async () => {
  try {
    UserRepository.createTable();
   // MedicationRepository.createTable();
    console.log("📦 Banco de dados inicializado com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao inicializar o banco de dados:", error);
  }
};

import { openDatabase } from 'react-native-sqlite-storage';
const db = openDatabase({ name: 'medcontrol.db' });

export const dropAllTables = () => {
  db.transaction((tx) => {
    tx.executeSql('DROP TABLE IF EXISTS users;', [],
      () => console.log('Tabela users deletada com sucesso.'),
      (_, error) => {
        console.error('Erro ao deletar a tabela users:', error);
        return true;
      }
    );

    // Adicione outras tabelas aqui, se necessário:
    // tx.executeSql('DROP TABLE IF EXISTS medications;');
    // tx.executeSql('DROP TABLE IF EXISTS profiles;');
  });
};

import { openDatabase } from 'react-native-sqlite-storage';
import dayjs from 'dayjs';
import DateUtils from '../utils/DateUtils';

const db = openDatabase({ name: 'medcontrol.db' });

const MedicationRepository = {
  createTable: () => {
    console.log('🔧 Criando tabela medications...');
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          nome TEXT,
          mgPorComprimido REAL,
          mgPorDose REAL,
          dosesPorDia INTEGER,
          estoque INTEGER,
          dataCadastro TEXT,
          horarios TEXT
        );`,
        [],
        () => console.log('✅ Tabela criada com sucesso'),
        (_, error) => {
          console.error('❌ Erro ao criar tabela:', error);
          return true;
        }
      );
    });
  },

  createMedication: (medication) => {
    console.log('📦 Inserindo medicamento:', medication);
    return new Promise(resolve => {
      const dataCadastro = medication.dataCadastro
        ? new Date(medication.dataCadastro).toISOString()
        : new Date().toISOString();
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO medications
            (userId, nome, mgPorComprimido, mgPorDose, dosesPorDia, estoque, dataCadastro, horarios)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            medication.userId,
            medication.nome,
            medication.mgPorComprimido,
            medication.mgPorDose,
            medication.dosesPorDia,
            medication.estoque,
            dataCadastro,
            JSON.stringify(medication.horarios),
          ],
          (_, result) => {
            console.log('✅ Medicamento inserido, ID:', result.insertId);
            resolve(result.insertId);
          },
          (_, error) => {
            console.error('❌ Erro ao inserir medicamento:', error);
            resolve(null);
            return true;
          }
        );
      });
    });
  },

  getAll: () => {
    console.log('🔍 Buscando todos os medicamentos...');
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medications;',
          [],
          (_, { rows }) => {
            const meds = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              item.horarios = DateUtils.safeParseHorarios(item.horarios);
              item.dataCadastro = ensureISODate(item.dataCadastro);
              meds.push(item);
            }
            console.log(`✅ ${meds.length} medicamentos encontrados.`);
            resolve(meds);
          },
          (_, error) => {
            console.error('❌ Erro ao buscar medicamentos:', error);
            resolve([]);
            return true;
          }
        );
      });
    });
  },

  getMedicationsByUserId: (userId) => {
    console.log('🔍 Buscando medicamentos para o usuário:', userId);
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM medications WHERE userId = ?;',
          [userId],
          (_, { rows }) => {
            const meds = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              item.horarios = DateUtils.safeParseHorarios(item.horarios);
              item.dataCadastro = ensureISODate(item.dataCadastro);
              meds.push(item);
            }
            console.log(`✅ ${meds.length} medicamentos encontrados.`);
            resolve(meds);
          },
          (_, error) => {
            console.error('❌ Erro ao buscar medicamentos:', error);
            resolve([]);
            return true;
          }
        );
      });
    });
  },

  deleteUserIdNull: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM medications WHERE userId IS NULL;',
          [],
          () => {
            console.log('Medicamentos com userId null excluídos com sucesso.');
            resolve(true);
          },
          (_, error) => {
            console.error('Erro ao deletar medicamentos com userId null:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  },

  deleteMedication: (id) => {
    console.log('🗑️ Deletando medicamento com ID:', id);
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM medications WHERE id = ?;',
          [id],
          (_, result) => {
            console.log('✅ Deleção realizada. Removidos:', result.rowsAffected);
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('❌ Erro ao deletar medicamento:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  },

  getProximosMedicamentos: (userId) => {
     return new Promise((resolve, reject) => {
       if (!userId) {
         resolve([]);
         return;
       }

       const now = dayjs();

       db.transaction(tx => {
         tx.executeSql(
           `SELECT id, nome, mgPorComprimido, mgPorDose, dosesPorDia, estoque, horarios, dataCadastro
            FROM medications
            WHERE userId = ?
            ORDER BY dataCadastro ASC;`,
           [userId],
           (_, { rows }) => {
             const medicamentos = [];
             for (let i = 0; i < rows.length; i++) {
               const med = rows.item(i);
               let horariosArray = [];
               try {
                 horariosArray = DateUtils.safeParseHorarios(med.horarios);
               } catch {
                 horariosArray = [];
               }
               med.dataCadastro = ensureISODate(med.dataCadastro);
               // calcula próximos horários futuros
               const proximosHorarios = horariosArray
                 .map(horarioStr => {
                   const [hour, minute] = horarioStr.split(':').map(Number);
                   return dayjs().hour(hour).minute(minute).second(0);
                 })
                 .filter(h => h.isAfter(now))
                 .sort((a, b) => (a.isBefore(b) ? -1 : 1));

               if (proximosHorarios.length > 0) {
                 medicamentos.push({
                   id: med.id,
                   nome: med.nome,
                   dose: `${med.mgPorDose} mg`,
                   quantidade: Math.ceil(med.mgPorDose / med.mgPorComprimido),
                   horarios: horariosArray,  // **<- inclui o array original aqui**
                   horario: proximosHorarios[0].format('HH:mm'), // próximo horário (opcional)
                 });
               }
             }
             resolve(medicamentos);
           },
           (_, error) => {
             reject(error);
             return false;
           }
         );
       });
     });
   },

  deleteMedicationsByUserId: (userId) => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM medications WHERE userId = ?;',
          [userId],
          () => resolve(true),
          (_, error) => {
            console.error('Erro ao excluir medicamentos:', error);
            resolve(false);
            return true;
          }
        );
      });
    });
  },

  updateMedication: (med) => {
    console.log('✏️ Atualizando medicamento:', med);
    return new Promise(resolve => {
      const dataCadastro = med.dataCadastro
        ? new Date(med.dataCadastro).toISOString()
        : new Date().toISOString();
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE medications SET
            nome = ?, mgPorComprimido = ?, mgPorDose = ?, dosesPorDia = ?, estoque = ?, horarios = ?, dataCadastro = ?
           WHERE id = ?;`,
          [
            med.nome,
            med.mgPorComprimido,
            med.mgPorDose,
            med.dosesPorDia,
            med.estoque,
            JSON.stringify(med.horarios),
            dataCadastro,
            med.id,
          ],
          (_, result) => {
            console.log('✅ Atualização concluída. Linhas afetadas:', result.rowsAffected);
            resolve(result.rowsAffected > 0);
          },
          (_, error) => {
            console.error('❌ Erro ao atualizar medicamento:', error);
            resolve(false);
            return true;
          }
        );
      });
    });
  },

  // Exporta todos os medicamentos como array de objetos
  exportarTodosMedicamentos: async () => {
    return await MedicationRepository.getAll();
  },

  // Deleta a tabela de medicamentos
  deletarTabelaMedicamentos: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DROP TABLE IF EXISTS medications;',
          [],
          () => {
            console.log('Tabela de medicamentos deletada com sucesso.');
            resolve(true);
          },
          (_, error) => {
            console.error('Erro ao deletar tabela de medicamentos:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  },

  // Cria a tabela de medicamentos
  criarTabelaMedicamentos: () => {
    MedicationRepository.createTable();
  },

  // Insere vários medicamentos em lote
  inserirMedicamentosEmLote: async (medicamentos) => {
    for (const med of medicamentos) {
      await MedicationRepository.createMedication(med);
    }
    console.log('Todos os medicamentos foram inseridos na nova tabela.');
  },
};

function ensureISODate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  // Se já for ISO, retorna igual
  if (dateStr.length > 10) return dateStr;
  // Se vier como YYYY-MM-DD, converte para ISO
  return new Date(dateStr + 'T00:00:00.000Z').toISOString();
}

export default MedicationRepository;

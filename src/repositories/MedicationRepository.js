import { openDatabase } from 'react-native-sqlite-storage';
import dayjs from 'dayjs';
import DateUtils from '../utils/DateUtils';

const db = openDatabase({ name: 'medcontrol.db' });

const MedicationRepository = {
  createTable: () => {
    console.log('🔧 Criando tabela medications...');
    return new Promise((resolve) => {
      resolve.called = false;
      let tableCreated = false;
      let columnChecked = false;
      
      db.transaction(
        (tx) => {
          // Primeiro cria a tabela
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
              horarios TEXT,
              calendarEventIds TEXT
            );`,
            [],
            () => {
              console.log('✅ Tabela criada/verificada com sucesso');
              tableCreated = true;
              
              // Verifica se a coluna calendarEventIds existe antes de tentar adicionar
              tx.executeSql(
                `PRAGMA table_info(medications);`,
                [],
                (_, result) => {
                  const columns = [];
                  for (let i = 0; i < result.rows.length; i++) {
                    columns.push(result.rows.item(i).name);
                  }
                  console.log('📋 Colunas existentes na tabela:', columns);
                  columnChecked = true;
                  
                  if (!columns.includes('calendarEventIds')) {
                    console.log('📋 Adicionando coluna calendarEventIds...');
                    tx.executeSql(
                      `ALTER TABLE medications ADD COLUMN calendarEventIds TEXT;`,
                      [],
                      () => {
                        console.log('✅ Coluna calendarEventIds adicionada');
                        if (!resolve.called) {
                          resolve.called = true;
                          resolve(true);
                        }
                      },
                      (_, error) => {
                        console.warn('⚠️ Erro ao adicionar coluna (pode já existir):', error?.message);
                        if (!resolve.called) {
                          resolve.called = true;
                          resolve(true); // Continua mesmo se falhar
                        }
                      }
                    );
                  } else {
                    console.log('ℹ️ Coluna calendarEventIds já existe');
                    if (!resolve.called) {
                      resolve.called = true;
                      resolve(true);
                    }
                  }
                },
                (_, error) => {
                  console.warn('⚠️ Erro ao verificar colunas (continuando):', error?.message);
                  if (!resolve.called) {
                    resolve.called = true;
                    resolve(true); // Continua mesmo se falhar na verificação
                  }
                }
              );
            },
            (_, error) => {
              console.error('❌ Erro ao criar tabela:', error);
              resolve(false);
              return true;
            }
          );
        },
        (error) => {
          console.error('❌ Erro na transação de criação de tabela:', error);
          resolve(false);
        },
        () => {
          console.log('✅ Transação de criação de tabela concluída');
          // Garante que resolve se a transação terminar
          setTimeout(() => {
            if (!resolve.called) {
              console.log('📋 Resolvendo Promise após conclusão da transação');
              resolve.called = true;
              resolve(true);
            }
          }, 300);
        }
      );
    });
  },

  createMedication: (medication) => {
    console.log('📦 Inserindo medicamento:', medication);
    return new Promise(async (resolve) => {
      try {
        // Garante que a tabela existe antes de inserir
        console.log('📋 Verificando/criando tabela antes de inserir...');
        const tableCreated = await MedicationRepository.createTable();
        console.log('📋 Resultado da criação de tabela:', tableCreated);
        
        if (!tableCreated) {
          console.error('❌ Falha ao criar tabela, tentando novamente...');
          await new Promise(r => setTimeout(r, 300));
          const retryResult = await MedicationRepository.createTable();
          console.log('📋 Resultado da segunda tentativa:', retryResult);
        }
        
        // Aguarda um pouco para garantir que a transação foi concluída
        await new Promise(r => setTimeout(r, 200));
        console.log('📋 Tabela verificada, prosseguindo com inserção...');

        const dataCadastro = medication.dataCadastro
          ? new Date(medication.dataCadastro).toISOString()
          : new Date().toISOString();

        // Validação de dados
        if (!medication.nome || !medication.userId) {
          console.error('❌ Erro: nome ou userId não fornecido');
          resolve(null);
          return;
        }

        console.log('📋 Valores que serão inseridos:', [
          medication.userId || null,
          medication.nome || '',
          medication.mgPorComprimido ? parseFloat(medication.mgPorComprimido) || 0 : 0,
          medication.mgPorDose ? parseFloat(medication.mgPorDose) || 0 : 0,
          medication.dosesPorDia ? parseInt(medication.dosesPorDia) || 0 : 0,
          medication.estoque ? parseInt(medication.estoque) || 0 : 0,
          dataCadastro,
          medication.horarios ? JSON.stringify(medication.horarios) : '[]',
          medication.calendarEventIds ? JSON.stringify(medication.calendarEventIds) : null,
        ]);

        // Verifica se a tabela existe antes de inserir
        const tableExists = await new Promise((tableResolve) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT name FROM sqlite_master WHERE type='table' AND name='medications';",
              [],
              (_, result) => {
                const exists = result.rows.length > 0;
                console.log('📋 Tabela medications existe?', exists);
                tableResolve(exists);
              },
              () => {
                console.log('📋 Erro ao verificar tabela, assumindo que não existe');
                tableResolve(false);
              }
            );
          });
        });

        if (!tableExists) {
          console.error('❌ Tabela não existe! Criando novamente...');
          const created = await MedicationRepository.createTable();
          console.log('📋 Tabela criada?', created);
          // Aguarda um pouco mais para garantir que a transação foi concluída
          await new Promise(r => setTimeout(r, 500));
          
          // Verifica novamente
          const existsAfter = await new Promise((tableResolve) => {
            db.transaction((tx) => {
              tx.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='medications';",
                [],
                (_, result) => {
                  tableResolve(result.rows.length > 0);
                },
                () => tableResolve(false)
              );
            });
          });
          
          if (!existsAfter) {
            console.error('❌ Tabela ainda não existe após criação!');
            resolve(null);
            return;
          }
        }

        db.transaction(
          (tx) => {
            console.log('📋 Executando INSERT...');
            tx.executeSql(
              `INSERT INTO medications
                (userId, nome, mgPorComprimido, mgPorDose, dosesPorDia, estoque, dataCadastro, horarios, calendarEventIds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
              [
                medication.userId || null,
                medication.nome || '',
                medication.mgPorComprimido ? parseFloat(medication.mgPorComprimido) || 0 : 0,
                medication.mgPorDose ? parseFloat(medication.mgPorDose) || 0 : 0,
                medication.dosesPorDia ? parseInt(medication.dosesPorDia) || 0 : 0,
                medication.estoque ? parseInt(medication.estoque) || 0 : 0,
                dataCadastro,
                medication.horarios ? JSON.stringify(medication.horarios) : '[]',
                medication.calendarEventIds ? JSON.stringify(medication.calendarEventIds) : null,
              ],
              (tx, result) => {
                console.log('📋 Resultado do INSERT:', result);
                const insertId = result.insertId || result.insertId || (result.rows && result.rows.insertId);
                console.log('✅ Medicamento inserido, ID:', insertId);
                if (!insertId) {
                  // Tenta buscar o último ID inserido
                  tx.executeSql('SELECT last_insert_rowid() as id;', [], (_, res) => {
                    const id = res.rows.item(0).id;
                    console.log('✅ ID obtido via last_insert_rowid:', id);
                    resolve(id);
                  });
                } else {
                  resolve(insertId);
                }
              },
              (tx, error) => {
                console.error('❌ Erro ao inserir medicamento no executeSql:');
                console.error('❌ Erro:', error);
                console.error('❌ Tipo:', typeof error);
                if (error) {
                  console.error('❌ Mensagem:', error.message);
                  console.error('❌ Código:', error.code);
                  console.error('❌ Stack:', error.stack);
                }
                // Tenta verificar se a tabela existe
                tx.executeSql(
                  "SELECT name FROM sqlite_master WHERE type='table' AND name='medications';",
                  [],
                  (_, result) => {
                    if (result.rows.length === 0) {
                      console.error('❌ Tabela medications não existe!');
                    } else {
                      console.log('✅ Tabela medications existe');
                    }
                  }
                );
                resolve(null);
                return true;
              }
            );
          },
          (error) => {
            console.error('❌ Erro na transação:');
            console.error('❌ Erro:', error);
            console.error('❌ Tipo:', typeof error);
            if (error) {
              console.error('❌ Mensagem:', error.message);
              console.error('❌ Código:', error.code);
            }
            resolve(null);
          },
          () => {
            console.log('✅ Transação concluída');
          }
        );
      } catch (error) {
        console.error('❌ Erro geral ao criar medicamento:', error);
        resolve(null);
      }
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
              // Parse seguro de calendarEventIds
              try {
                item.calendarEventIds = item.calendarEventIds ? JSON.parse(item.calendarEventIds) : [];
              } catch (e) {
                console.warn('[MedicationRepository] Erro ao fazer parse de calendarEventIds:', e);
                item.calendarEventIds = [];
              }
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
              // Parse seguro de calendarEventIds
              try {
                item.calendarEventIds = item.calendarEventIds ? JSON.parse(item.calendarEventIds) : [];
              } catch (e) {
                console.warn('[MedicationRepository] Erro ao fazer parse de calendarEventIds:', e);
                item.calendarEventIds = [];
              }
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
            nome = ?, mgPorComprimido = ?, mgPorDose = ?, dosesPorDia = ?, estoque = ?, horarios = ?, dataCadastro = ?, calendarEventIds = ?
           WHERE id = ?;`,
          [
            med.nome,
            med.mgPorComprimido,
            med.mgPorDose,
            med.dosesPorDia,
            med.estoque,
            JSON.stringify(med.horarios),
            dataCadastro,
            med.calendarEventIds ? JSON.stringify(med.calendarEventIds) : null,
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

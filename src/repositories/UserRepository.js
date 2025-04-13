import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase({ name: 'medcontrol.db' });

const UserRepository = {
  createTable: () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        );`
      );
    });
  },

  createUser: (username, password) => {
    console.log('Tentando criar usuário:', username, password);
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO users (username, password) VALUES (?, ?);',
          [username, password],
          (_, result) => {
            console.log('Usuário criado com sucesso:', result);
            resolve(result.insertId);
          },
          (_, error) => {
            console.error('Erro ao criar usuário:', error);
            resolve(null);
          }
        );
      });
    });
  },

  getUserById: (id) => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?;',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0)); // ← FORMA SEGURA
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error("Erro ao buscar usuário por ID:", error);
            resolve(null);
          }
        );
      });
    });
  },


  getUserByUsername: (username) => {
    console.log('Buscando usuário:', username);
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ?;',
          [username],
          (_, { rows }) => {
            if (rows.length > 0) {
              console.log('Usuário encontrado:', rows.item(0));
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error("Erro ao buscar usuário:", error);
            resolve(null);
          }
        );
      });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users;',
          [],
          (_, { rows }) => {
            const users = [];
            for (let i = 0; i < rows.length; i++) {
              users.push(rows.item(i));
            }
            resolve(users);
          },
          (_, error) => {
            console.error("Erro ao listar usuários:", error);
            resolve([]);
          }
        );
      });
    });
  },

  updateUser: (id, username, password) => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE users SET username = ?, password = ? WHERE id = ?;',
          [username, password, id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => {
            console.error("Erro ao atualizar usuário:", error);
            resolve(false);
          }
        );
      });
    });
  },

  deleteUser: (id) => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM users WHERE id = ?;',
          [id],
          (_, result) => resolve(result.rowsAffected > 0),
          (_, error) => {
            console.error("Erro ao deletar usuário:", error);
            resolve(false);
          }
        );
      });
    });
  }
};

export default UserRepository;

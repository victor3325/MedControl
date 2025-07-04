import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase({ name: 'medcontrol.db' });

const UserRepository = {
  createTable: () => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          alergias TEXT
        );`
      );
    });
  },

  createUser: (username, alergias = []) => {
    console.log('Tentando criar usuário:', username, alergias);
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO users (username, alergias) VALUES (?, ?);',
          [username, JSON.stringify(alergias)],
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
              const user = rows.item(0);
              user.alergias = user.alergias ? JSON.parse(user.alergias) : [];
              resolve(user);
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
              const user = rows.item(0);
              user.alergias = user.alergias ? JSON.parse(user.alergias) : [];
              resolve(user);
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
              const user = rows.item(i);
              user.alergias = user.alergias ? JSON.parse(user.alergias) : [];
              users.push(user);
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

  updateUser: (id, username, alergias = []) => {
    return new Promise((resolve) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE users SET username = ?, alergias = ? WHERE id = ?;',
          [username, JSON.stringify(alergias), id],
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

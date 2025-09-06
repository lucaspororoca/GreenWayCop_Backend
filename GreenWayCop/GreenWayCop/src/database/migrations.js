const db = require('../config/db');
const logger = require('../config/logger');

async function runMigrations() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuarios INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categorias (
        id_categoria INTERGER AUTO_INCREMENT NOT NULL,
        nome_categoria VARCHAR(45) NOT NULL,
        id_categoria PRIMARY KEY
      );
      
      CREATE TABLE IF NOT EXISTS destinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        endereco TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS rotas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        origem_lat REAL NOT NULL,
        origem_lng REAL NOT NULL,
        destino_id INTEGER NOT NULL,
        transporte TEXT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id),
        FOREIGN KEY (destino_id) REFERENCES destinos(id)
      );
    `);
    logger.info('Migrations executadas com sucesso');
  } catch (error) {
    logger.error(`Erro nas migrations: ${error.message}`);
    process.exit(1);
  }
}

module.exports = runMigrations;
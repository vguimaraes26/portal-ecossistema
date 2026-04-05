const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_URL || './data.json';

/**
 * Inicializa banco de dados (JSON para simplicidade)
 */
function initDatabase() {
  try {
    console.log(`📦 Inicializando banco de dados em: ${DB_PATH}`);

    let db = {
      news_raw: [],
      news_processed: [],
      segments: [
        { id: 1, name: 'Investimento', description: 'Notícias sobre mercado, investimentos e finanças' },
        { id: 2, name: 'Contabilidade', description: 'Notícias sobre IRPF, balanço e conformidade' },
        { id: 3, name: 'Estratégia', description: 'Notícias sobre tendências e oportunidades' }
      ],
      processing_log: []
    };

    // Carrega arquivo existente se houver
    if (fs.existsSync(DB_PATH)) {
      const existing = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      db = { ...db, ...existing };
      console.log('✅ Banco de dados carregado com sucesso');
    } else {
      // Cria novo arquivo
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      console.log('✅ Banco de dados criado com sucesso');
    }

    return db;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
    throw error;
  }
}

/**
 * Salva banco em arquivo
 */
function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('❌ Erro ao salvar banco:', error.message);
    throw error;
  }
}

/**
 * Obtém instância do banco (singleton)
 */
let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

function saveDb() {
  if (dbInstance) {
    saveDatabase(dbInstance);
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  saveDb,
  DB_PATH
};

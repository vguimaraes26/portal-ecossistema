/**
 * BACKUP SERVICE
 * Gerencia backup automático e restore de arquivos
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7');
const ARTICLES_FILE = path.join(__dirname, '../../..', 'articles.json');
const VERSIONS_FILE = path.join(__dirname, '../../..', 'articles_versions.json');

/**
 * Cria diretório de backup se não existir
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[BACKUP] Diretório criado: ${BACKUP_DIR}`);
  }
}

/**
 * Gera nome de arquivo com timestamp
 */
function generateBackupFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `articles_${year}${month}${day}_${hours}${minutes}${seconds}.json`;
}

/**
 * Executa backup dos arquivos principais
 */
function performBackup() {
  try {
    ensureBackupDir();

    const backupData = {
      createdAt: new Date().toISOString(),
      articlesFile: null,
      versionsFile: null,
      metadata: {
        articlesCount: 0,
        versionsCount: 0
      }
    };

    // Backup de articles.json
    if (fs.existsSync(ARTICLES_FILE)) {
      const articlesContent = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
      backupData.articlesFile = articlesContent;
      backupData.metadata.articlesCount = articlesContent.articles?.length || 0;
    }

    // Backup de articles_versions.json
    if (fs.existsSync(VERSIONS_FILE)) {
      const versionsContent = JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
      backupData.versionsFile = versionsContent;
      backupData.metadata.versionsCount = versionsContent.versions?.length || 0;
    }

    // Salva arquivo de backup
    const backupFilename = generateBackupFilename();
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`[BACKUP] Backup criado: ${backupFilename}`);

    // Limpa backups antigos
    const cleanedFiles = cleanOldBackups();

    return {
      success: true,
      backupFile: backupFilename,
      backupPath,
      size: fs.statSync(backupPath).size,
      metadata: backupData.metadata,
      cleanedFiles
    };
  } catch (error) {
    console.error('[BACKUP] Erro ao executar backup:', error.message);
    throw error;
  }
}

/**
 * Remove backups mais antigos que o período de retenção
 */
function cleanOldBackups() {
  const cleanedFiles = [];

  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const cutoffDate = new Date(Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      if (!file.startsWith('articles_')) return;

      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        cleanedFiles.push(file);
        console.log(`[BACKUP] Arquivo deletado: ${file}`);
      }
    });
  } catch (error) {
    console.error('[BACKUP] Erro ao limpar backups antigos:', error.message);
  }

  return cleanedFiles;
}

/**
 * Lista todos os backups disponíveis
 */
function listBackups() {
  ensureBackupDir();

  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = [];

    files.forEach(file => {
      if (!file.startsWith('articles_')) return;

      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: content.createdAt,
          articleCount: content.metadata?.articlesCount || 0,
          versionCount: content.metadata?.versionsCount || 0,
          modifiedAt: stats.mtime.toISOString()
        });
      } catch (parseError) {
        console.error(`[BACKUP] Erro ao ler ${file}:`, parseError.message);
      }
    });

    return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('[BACKUP] Erro ao listar backups:', error.message);
    throw error;
  }
}

/**
 * Restaura backup (cria novo backup antes de restaurar)
 */
function restoreFromBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup não encontrado: ${backupFilename}`);
    }

    // Cria ponto de recuperação (backup da situação atual)
    console.log('[BACKUP] Criando ponto de recuperação...');
    performBackup();

    // Carrega dados do backup
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Restaura articles.json
    if (backupData.articlesFile) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(backupData.articlesFile, null, 2));
      console.log('[BACKUP] articles.json restaurado');
    }

    // Restaura articles_versions.json
    if (backupData.versionsFile) {
      fs.writeFileSync(VERSIONS_FILE, JSON.stringify(backupData.versionsFile, null, 2));
      console.log('[BACKUP] articles_versions.json restaurado');
    }

    return {
      success: true,
      message: 'Backup restaurado com sucesso',
      restored: {
        articles: backupData.metadata?.articlesCount || 0,
        versions: backupData.metadata?.versionsCount || 0
      }
    };
  } catch (error) {
    console.error('[BACKUP] Erro ao restaurar backup:', error.message);
    throw error;
  }
}

/**
 * Retorna tamanho total de backups
 */
function getBackupSize() {
  ensureBackupDir();

  try {
    const files = fs.readdirSync(BACKUP_DIR);
    let totalSize = 0;

    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });

    return {
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      fileCount: files.length
    };
  } catch (error) {
    console.error('[BACKUP] Erro ao calcular tamanho:', error.message);
    return { totalSizeBytes: 0, totalSizeMB: '0.00', fileCount: 0 };
  }
}

/**
 * Deleta um backup específico
 */
function deleteBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup não encontrado: ${backupFilename}`);
    }

    fs.unlinkSync(backupPath);
    console.log(`[BACKUP] Arquivo deletado: ${backupFilename}`);

    return {
      success: true,
      message: 'Backup deletado com sucesso'
    };
  } catch (error) {
    console.error('[BACKUP] Erro ao deletar backup:', error.message);
    throw error;
  }
}

/**
 * Estatísticas de backup
 */
function getBackupStats() {
  const backups = listBackups();
  const size = getBackupSize();

  return {
    totalBackups: backups.length,
    ...size,
    oldestBackup: backups.length > 0 ? backups[backups.length - 1].createdAt : null,
    newestBackup: backups.length > 0 ? backups[0].createdAt : null,
    retentionDays: BACKUP_RETENTION_DAYS
  };
}

module.exports = {
  performBackup,
  listBackups,
  restoreFromBackup,
  deleteBackup,
  getBackupSize,
  getBackupStats,
  cleanOldBackups,
  ensureBackupDir
};

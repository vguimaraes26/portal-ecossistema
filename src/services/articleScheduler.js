/**
 * ARTICLE SCHEDULER
 * Gerencia jobs agendados (backups, scraping, publicação)
 */

const cron = require('node-cron');
const backupService = require('./backupService');

let scheduledJobs = [];

/**
 * Inicia todos os jobs agendados
 */
function startScheduler() {
  console.log('[SCHEDULER] Iniciando agendador...');

  // Job 1: Backup automático à meia-noite
  const backupJob = cron.schedule('0 0 * * *', async () => {
    console.log('[SCHEDULER] ⏰ Executando backup automático...');
    try {
      const result = backupService.performBackup();
      console.log('[SCHEDULER] ✅ Backup concluído:', result.backupFile);
    } catch (error) {
      console.error('[SCHEDULER] ❌ Erro no backup:', error.message);
    }
  }, { timezone: 'America/Sao_Paulo' });

  scheduledJobs.push({ name: 'backup', job: backupJob });

  // Job 2: Limpeza de backups antigos (diariamente às 1:00 AM)
  const cleanupJob = cron.schedule('0 1 * * *', async () => {
    console.log('[SCHEDULER] ⏰ Executando limpeza de backups antigos...');
    try {
      const cleaned = backupService.cleanOldBackups();
      if (cleaned.length > 0) {
        console.log('[SCHEDULER] ✅ Backups removidos:', cleaned);
      } else {
        console.log('[SCHEDULER] ✅ Nenhum backup expirado');
      }
    } catch (error) {
      console.error('[SCHEDULER] ❌ Erro na limpeza:', error.message);
    }
  }, { timezone: 'America/Sao_Paulo' });

  scheduledJobs.push({ name: 'cleanup', job: cleanupJob });

  console.log('[SCHEDULER] ✅ Agendador iniciado com sucesso');
  console.log('[SCHEDULER] 📅 Jobs configurados:');
  console.log('[SCHEDULER]   - Backup automático: 00:00 (meia-noite)');
  console.log('[SCHEDULER]   - Limpeza de backups: 01:00 (1:00 AM)');
  console.log('[SCHEDULER] 🕐 Timezone: America/Sao_Paulo (UTC-3)');
}

/**
 * Para todos os jobs agendados
 */
function stopScheduler() {
  console.log('[SCHEDULER] Parando agendador...');
  scheduledJobs.forEach(item => {
    item.job.stop();
    console.log(`[SCHEDULER] ⛔ Job "${item.name}" parado`);
  });
  scheduledJobs = [];
}

/**
 * Executa backup manualmente
 */
function runBackupNow() {
  console.log('[SCHEDULER] 🚀 Executando backup manual...');
  try {
    const result = backupService.performBackup();
    console.log('[SCHEDULER] ✅ Backup manual concluído:', result.backupFile);
    return result;
  } catch (error) {
    console.error('[SCHEDULER] ❌ Erro no backup manual:', error.message);
    throw error;
  }
}

/**
 * Retorna status de todos os jobs
 */
function getStatus() {
  return {
    running: scheduledJobs.length > 0,
    jobs: scheduledJobs.map(item => ({
      name: item.name,
      running: !item.job._destroyed,
      task: item.name
    })),
    nextExecution: {
      backup: 'Meia-noite (00:00)',
      cleanup: '1:00 AM'
    },
    timezone: 'America/Sao_Paulo'
  };
}

module.exports = {
  startScheduler,
  stopScheduler,
  runBackupNow,
  getStatus
};

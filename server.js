const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./src/db/init');
const newsRoutes = require('./src/api/routes/news');
const segmentsRoutes = require('./src/api/routes/segments');
const statsRoutes = require('./src/api/routes/stats');
const articlesRoutes = require('./src/api/routes/articles');
const newsletterRoutes = require('./src/api/routes/newsletter');
const templatesRoutes = require('./src/api/routes/templates');
const newsletterDigestRoutes = require('./src/api/routes/newsletter-digest');
const { startScheduler, stopScheduler } = require('./src/services/articleScheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Inicializa banco
try {
  initDatabase();
} catch (error) {
  console.error('❌ Erro ao inicializar banco:', error.message);
  process.exit(1);
}

// Inicia scheduler
try {
  startScheduler();
} catch (error) {
  console.error('⚠️  Aviso: Erro ao inicializar scheduler:', error.message);
  // Não mata o processo, apenas avisa
}

// Rotas
app.use('/api/news', newsRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/newsletter-digest', newsletterDigestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   🚀 PORTAL ECOSSISTEMA                    ║
║   ${new Date().toLocaleString('pt-BR')}
╠════════════════════════════════════════════╣
║   http://localhost:${PORT}
║   API: http://localhost:${PORT}/api/news
║   Stats: http://localhost:${PORT}/api/stats
║   Health: http://localhost:${PORT}/api/health
╚════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM recebido, encerrando...');
    stopScheduler();
    server.close(() => {
      console.log('[SERVER] Servidor encerrado');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[SERVER] SIGINT recebido, encerrando...');
    stopScheduler();
    server.close(() => {
      console.log('[SERVER] Servidor encerrado');
      process.exit(0);
    });
  });
}

module.exports = app;

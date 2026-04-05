/**
 * ARTICLES ROUTES
 * Endpoints para artigos completos com comunicação customizada
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const models = require('../../db/models');
const versioningService = require('../../services/versioningService');
const backupService = require('../../services/backupService');

const router = express.Router();
const ARTICLES_FILE = path.join(__dirname, '../../..', 'articles.json');

/**
 * GET /api/articles
 * Lista todos os artigos processados
 */
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return res.status(404).json({
        error: 'Nenhum artigo gerado ainda',
        message: 'Execute "npm run articles" para gerar artigos',
        articles: []
      });
    }

    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar artigos', details: error.message });
  }
});

/**
 * GET /api/articles/:id
 * Obtém um artigo específico
 */
router.get('/:id', (req, res) => {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const article = data.articles.find(a => a.id === parseInt(req.params.id));

    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar artigo' });
  }
});

/**
 * GET /api/articles/segment/:segment
 * Lista artigos por segmento
 */
router.get('/segment/:segment', (req, res) => {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return res.status(404).json({ articles: [] });
    }

    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const articles = data.articles.filter(a => a.segment === req.params.segment);

    res.json({
      segment: req.params.segment,
      count: articles.length,
      articles: articles
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao filtrar artigos' });
  }
});

/**
 * GET /api/articles/stats/summary
 * Retorna estatísticas dos artigos
 */
router.get('/stats/summary', (req, res) => {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      return res.json({
        total: 0,
        by_segment: {},
        avg_word_count: 0
      });
    }

    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const articles = data.articles || [];

    const stats = {
      total: articles.length,
      by_segment: {},
      avg_word_count: 0,
      total_words: 0,
      generated_at: data.generated_at
    };

    articles.forEach(article => {
      if (!stats.by_segment[article.segment]) {
        stats.by_segment[article.segment] = 0;
      }
      stats.by_segment[article.segment]++;
      stats.total_words += article.metadata.word_count;
    });

    if (articles.length > 0) {
      stats.avg_word_count = Math.round(stats.total_words / articles.length);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular estatísticas' });
  }
});

/**
 * PATCH /api/articles/:id
 * Atualiza um artigo existente
 */
router.patch('/:id', (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { headline, body, segment, image, metadata, social } = req.body;

    // Valida campos obrigatórios
    if (!headline && !body && !segment && !image) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar',
        message: 'Forneça pelo menos um campo: headline, body, segment ou image'
      });
    }

    // Atualiza artigo via models
    const updatedArticle = models.updateArticle(articleId, {
      headline,
      body,
      segment,
      image,
      metadata,
      social
    });

    res.json({
      success: true,
      message: 'Artigo atualizado com sucesso',
      data: updatedArticle
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao atualizar artigo',
      message: error.message
    });
  }
});

/**
 * GET /api/articles/:id/versions
 * Retorna histórico de versões de um artigo
 */
router.get('/:id/versions', (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const versions = versioningService.getAllVersions(articleId);

    res.json({
      success: true,
      articleId,
      total: versions.length,
      versions
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao carregar histórico',
      message: error.message
    });
  }
});

/**
 * POST /api/articles/:id/rollback/:versionId
 * Faz rollback para uma versão anterior
 */
router.post('/:id/rollback/:versionId', (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { versionId } = req.params;

    // Restaura versão anterior
    const restoredData = versioningService.rollbackToVersion(articleId, versionId);

    // Atualiza artigo com dados restaurados
    const updatedArticle = models.updateArticle(articleId, restoredData);

    res.json({
      success: true,
      message: 'Rollback executado com sucesso',
      data: updatedArticle
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrada') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao fazer rollback',
      message: error.message
    });
  }
});

/**
 * GET /api/articles/:id/versions/compare
 * Compara duas versões
 */
router.get('/:id/versions/compare', (req, res) => {
  try {
    const { v1, v2 } = req.query;

    if (!v1 || !v2) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios',
        message: 'Forneça query params: ?v1=versionId1&v2=versionId2'
      });
    }

    const comparison = versioningService.compareVersions(v1, v2);

    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao comparar versões',
      message: error.message
    });
  }
});

/**
 * ADMIN ROUTES - BACKUP
 */

/**
 * GET /api/admin/backups
 * Lista todos os backups disponíveis (ADMIN ONLY)
 */
router.get('/admin/backups', (req, res) => {
  try {
    const backups = backupService.listBackups();
    const stats = backupService.getBackupStats();

    res.json({
      success: true,
      stats,
      backups
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar backups',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/backups/manual
 * Executa backup manual agora (ADMIN ONLY)
 */
router.post('/admin/backups/manual', (req, res) => {
  try {
    const result = backupService.performBackup();

    res.json({
      success: true,
      message: 'Backup executado com sucesso',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao executar backup',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/backups/restore/:filename
 * Restaura um backup específico (ADMIN ONLY)
 */
router.post('/admin/backups/restore/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        error: 'Confirmação obrigatória',
        message: 'Envie { confirm: true } no corpo da requisição'
      });
    }

    const result = backupService.restoreFromBackup(filename);

    res.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao restaurar backup',
      message: error.message
    });
  }
});

/**
 * DELETE /api/admin/backups/:filename
 * Deleta um backup específico (ADMIN ONLY)
 */
router.delete('/admin/backups/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({
        error: 'Confirmação obrigatória',
        message: 'Envie { confirm: true } no corpo da requisição'
      });
    }

    const result = backupService.deleteBackup(filename);

    res.json({
      success: true,
      message: 'Backup deletado com sucesso',
      data: result
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao deletar backup',
      message: error.message
    });
  }
});

/**
 * GET /api/admin/backups/stats
 * Retorna estatísticas de backups (ADMIN ONLY)
 */
router.get('/admin/backups/stats', (req, res) => {
  try {
    const stats = backupService.getBackupStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter estatísticas',
      message: error.message
    });
  }
});

module.exports = router;

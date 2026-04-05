/**
 * NEWSLETTER DIGEST ROUTES
 * Endpoints para gerenciamento de digests semanais
 */

const express = require('express');
const newsletterDigestService = require('../../services/newsletterDigestService');

const router = express.Router();

/**
 * GET /api/newsletter-digest
 * Lista todos os digests
 */
router.get('/', (req, res) => {
  try {
    const digests = newsletterDigestService.listDigests();
    const stats = newsletterDigestService.getDigestStats();

    res.json({
      success: true,
      stats,
      digests
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar digests',
      message: error.message
    });
  }
});

/**
 * GET /api/newsletter-digest/:id
 * Obtém um digest específico
 */
router.get('/:id', (req, res) => {
  try {
    const digest = newsletterDigestService.getDigest(req.params.id);

    if (!digest) {
      return res.status(404).json({
        error: 'Digest não encontrado'
      });
    }

    res.json({
      success: true,
      digest
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter digest',
      message: error.message
    });
  }
});

/**
 * POST /api/newsletter-digest/create
 * Cria novo digest (ADMIN)
 */
router.post('/create', (req, res) => {
  try {
    const { articleIds, title, scheduledFor, options } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'articleIds deve ser um array não vazio'
      });
    }

    const digest = newsletterDigestService.createDigest(articleIds, {
      title,
      scheduledFor,
      ...options
    });

    res.status(201).json({
      success: true,
      message: 'Digest criado com sucesso',
      digest
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar digest',
      message: error.message
    });
  }
});

/**
 * POST /api/newsletter-digest/preview
 * Gera preview do digest
 */
router.post('/preview', (req, res) => {
  try {
    const { articleIds, options } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'articleIds deve ser um array não vazio'
      });
    }

    const html = newsletterDigestService.generatePreview(articleIds, options);

    res.json({
      success: true,
      html
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao gerar preview',
      message: error.message
    });
  }
});

/**
 * POST /api/newsletter-digest/:id/send
 * Marca digest como enviado (ADMIN)
 */
router.post('/:id/send', (req, res) => {
  try {
    const { sentToCount } = req.body;

    const digest = newsletterDigestService.markDigestAsSent(
      req.params.id,
      sentToCount || 0
    );

    res.json({
      success: true,
      message: 'Digest marcado como enviado',
      digest
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao enviar digest',
      message: error.message
    });
  }
});

/**
 * DELETE /api/newsletter-digest/:id
 * Deleta um digest (ADMIN)
 */
router.delete('/:id', (req, res) => {
  try {
    const digest = newsletterDigestService.deleteDigest(req.params.id);

    res.json({
      success: true,
      message: 'Digest deletado com sucesso',
      deletedDigest: digest
    });
  } catch (error) {
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    res.status(statusCode).json({
      error: 'Erro ao deletar digest',
      message: error.message
    });
  }
});

/**
 * GET /api/newsletter-digest/stats/summary
 * Estatísticas de digests
 */
router.get('/stats/summary', (req, res) => {
  try {
    const stats = newsletterDigestService.getDigestStats();

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

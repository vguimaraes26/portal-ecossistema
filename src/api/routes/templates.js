/**
 * TEMPLATES ROUTES
 * CRUD e gerenciamento de templates de posts
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const TEMPLATES_FILE = path.join(__dirname, '../../..', 'templates.json');

/**
 * Carrega templates do arquivo
 */
function loadTemplates() {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) {
      return { templates: [], metadata: { createdAt: new Date().toISOString() } };
    }
    return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
  } catch (error) {
    console.error('[TEMPLATES] Erro ao carregar:', error.message);
    return { templates: [], metadata: { createdAt: new Date().toISOString() } };
  }
}

/**
 * Salva templates no arquivo
 */
function saveTemplates(data) {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[TEMPLATES] Erro ao salvar:', error.message);
    throw error;
  }
}

/**
 * GET /api/templates
 * Lista todos os templates
 */
router.get('/', (req, res) => {
  try {
    const data = loadTemplates();
    res.json({
      success: true,
      total: data.templates.length,
      templates: data.templates
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao listar templates',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/:id
 * Obtém um template específico
 */
router.get('/:id', (req, res) => {
  try {
    const data = loadTemplates();
    const template = data.templates.find(t => t.id === req.params.id);

    if (!template) {
      return res.status(404).json({
        error: 'Template não encontrado'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter template',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/segment/:segment
 * Lista templates de um segmento específico
 */
router.get('/segment/:segment', (req, res) => {
  try {
    const data = loadTemplates();
    const templates = data.templates.filter(t => t.segment === req.params.segment);

    res.json({
      success: true,
      segment: req.params.segment,
      total: templates.length,
      templates
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao filtrar templates',
      message: error.message
    });
  }
});

/**
 * POST /api/templates
 * Cria novo template (ADMIN)
 */
router.post('/', (req, res) => {
  try {
    const { segment, name, description, content, example, placeholders } = req.body;

    if (!segment || !name || !content) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'segment, name e content são obrigatórios'
      });
    }

    const data = loadTemplates();

    // Gera ID único
    const maxId = Math.max(
      0,
      ...data.templates.map(t => parseInt(t.id.split('-')[1]) || 0)
    );
    const newId = `tpl-${String(maxId + 1).padStart(3, '0')}`;

    const newTemplate = {
      id: newId,
      segment,
      name,
      description: description || '',
      content,
      example: example || '',
      placeholders: placeholders || [],
      createdAt: new Date().toISOString()
    };

    data.templates.push(newTemplate);
    data.metadata.lastUpdate = new Date().toISOString();
    saveTemplates(data);

    console.log(`[TEMPLATES] Novo template criado: ${newId}`);

    res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      template: newTemplate
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao criar template',
      message: error.message
    });
  }
});

/**
 * PATCH /api/templates/:id
 * Atualiza um template (ADMIN)
 */
router.patch('/:id', (req, res) => {
  try {
    const data = loadTemplates();
    const template = data.templates.find(t => t.id === req.params.id);

    if (!template) {
      return res.status(404).json({
        error: 'Template não encontrado'
      });
    }

    // Atualiza campos permitidos
    const allowedFields = ['name', 'description', 'content', 'example', 'placeholders'];
    allowedFields.forEach(field => {
      if (field in req.body) {
        template[field] = req.body[field];
      }
    });

    template.updatedAt = new Date().toISOString();
    data.metadata.lastUpdate = new Date().toISOString();
    saveTemplates(data);

    console.log(`[TEMPLATES] Template atualizado: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      template
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao atualizar template',
      message: error.message
    });
  }
});

/**
 * DELETE /api/templates/:id
 * Deleta um template (ADMIN)
 */
router.delete('/:id', (req, res) => {
  try {
    const data = loadTemplates();
    const index = data.templates.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        error: 'Template não encontrado'
      });
    }

    const deletedTemplate = data.templates.splice(index, 1)[0];
    data.metadata.lastUpdate = new Date().toISOString();
    saveTemplates(data);

    console.log(`[TEMPLATES] Template deletado: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Template deletado com sucesso',
      deletedTemplate
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao deletar template',
      message: error.message
    });
  }
});

/**
 * POST /api/templates/:id/apply
 * Aplica template a um artigo (substitui placeholders)
 */
router.post('/:id/apply', (req, res) => {
  try {
    const { headline, segment, body, keywords, author, tone } = req.body;

    const data = loadTemplates();
    const template = data.templates.find(t => t.id === req.params.id);

    if (!template) {
      return res.status(404).json({
        error: 'Template não encontrado'
      });
    }

    // Substitui placeholders
    let result = template.content
      .replace(/{headline}/g, headline || '')
      .replace(/{segment}/g, segment || '')
      .replace(/{body}/g, body || '')
      .replace(/{keywords}/g, keywords || '')
      .replace(/{author}/g, author || '')
      .replace(/{tone}/g, tone || '');

    res.json({
      success: true,
      message: 'Template aplicado com sucesso',
      result,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        segment: template.segment
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao aplicar template',
      message: error.message
    });
  }
});

/**
 * GET /api/templates/stats
 * Estatísticas de templates
 */
router.get('/stats/summary', (req, res) => {
  try {
    const data = loadTemplates();

    const stats = {
      totalTemplates: data.templates.length,
      bySegment: {}
    };

    data.templates.forEach(t => {
      stats.bySegment[t.segment] = (stats.bySegment[t.segment] || 0) + 1;
    });

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

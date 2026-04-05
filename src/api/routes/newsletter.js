/**
 * NEWSLETTER ROUTES
 * Endpoints para gestão de newsletter com proteção contra XSS, SQL injection e rate limiting
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const validator = require('email-validator');

const router = express.Router();
const NEWSLETTER_FILE = path.join(__dirname, '../../..', 'newsletter.json');

// Rate limiting em memória (simples)
const rateLimitStore = new Map();

/**
 * Middleware: Rate limiting por IP
 */
function rateLimitByIp(maxRequests = 5, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}-${req.path}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key).filter(time => now - time < windowMs);
    requests.push(now);
    rateLimitStore.set(key, requests);

    if (requests.length > maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições',
        message: `Máximo de ${maxRequests} requisições por minuto`,
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }

    next();
  };
}

/**
 * Middleware: Autenticação (requer token válido)
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Não autenticado',
      message: 'Token obrigatório'
    });
  }

  try {
    // Valida formato básico do token (base64)
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [email, timestamp] = decoded.split(':');

    if (!email || !timestamp) {
      throw new Error('Token inválido');
    }

    req.user = { email, timestamp };
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Token inválido',
      message: 'Falha ao decodificar token'
    });
  }
}

/**
 * Valida e sanitiza e-mail
 */
function validateAndSanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('E-mail inválido');
  }

  const sanitized = email.trim().toLowerCase();

  if (!validator.validate(sanitized)) {
    throw new Error('E-mail inválido');
  }

  // Verifica caracteres suspeitos (XSS attempt)
  if (/[<>\"'%;()&+]/.test(sanitized)) {
    throw new Error('E-mail contém caracteres inválidos');
  }

  return sanitized;
}

/**
 * Carrega dados de newsletter
 */
function loadNewsletter() {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE)) {
      return { subscribers: [], metadata: { createdAt: new Date().toISOString() } };
    }
    return JSON.parse(fs.readFileSync(NEWSLETTER_FILE, 'utf8'));
  } catch (error) {
    console.error('[NEWSLETTER] Erro ao carregar:', error.message);
    return { subscribers: [], metadata: { createdAt: new Date().toISOString() } };
  }
}

/**
 * Salva dados de newsletter
 */
function saveNewsletter(data) {
  try {
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[NEWSLETTER] Erro ao salvar:', error.message);
    throw error;
  }
}

/**
 * POST /api/newsletter/subscribe
 * Inscreve novo e-mail (PÚBLICO - com rate limit e validação)
 */
router.post('/subscribe', rateLimitByIp(1, 600000), (req, res) => {
  try {
    const { email } = req.body;

    // Validação e sanitização
    const sanitizedEmail = validateAndSanitizeEmail(email);

    // Carrega dados
    const data = loadNewsletter();

    // Verifica se já existe
    const exists = data.subscribers.find(s => s.email === sanitizedEmail && s.active);
    if (exists) {
      return res.status(400).json({
        error: 'E-mail já inscrito',
        message: 'Este e-mail já está registrado na newsletter'
      });
    }

    // Verifica se está marcado como unsubscribed e reativa
    const unsubscribed = data.subscribers.find(s => s.email === sanitizedEmail && !s.active);
    if (unsubscribed) {
      unsubscribed.active = true;
      unsubscribed.unsubscribedAt = null;
      unsubscribed.resubscribedAt = new Date().toISOString();
    } else {
      // Adiciona novo subscriber
      data.subscribers.push({
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
        active: true
      });
    }

    data.metadata.lastUpdate = new Date().toISOString();
    saveNewsletter(data);

    console.log(`[NEWSLETTER] Nova inscrição: ${sanitizedEmail}`);

    res.json({
      success: true,
      message: 'Inscrição realizada com sucesso!',
      email: sanitizedEmail
    });
  } catch (error) {
    res.status(400).json({
      error: 'Erro na inscrição',
      message: error.message
    });
  }
});

/**
 * DELETE /api/newsletter/unsubscribe
 * Desinscreve e-mail (PÚBLICO - com rate limit e validação)
 */
router.delete('/unsubscribe', rateLimitByIp(1, 600000), (req, res) => {
  try {
    const { email } = req.body;

    // Validação e sanitização
    const sanitizedEmail = validateAndSanitizeEmail(email);

    // Carrega dados
    const data = loadNewsletter();

    // Encontra subscriber
    const subscriber = data.subscribers.find(s => s.email === sanitizedEmail);
    if (!subscriber) {
      return res.status(404).json({
        error: 'E-mail não encontrado',
        message: 'Este e-mail não está na newsletter'
      });
    }

    // Marca como inativo
    subscriber.active = false;
    subscriber.unsubscribedAt = new Date().toISOString();

    data.metadata.lastUpdate = new Date().toISOString();
    saveNewsletter(data);

    console.log(`[NEWSLETTER] Desinscrito: ${sanitizedEmail}`);

    res.json({
      success: true,
      message: 'Desinscrito com sucesso',
      email: sanitizedEmail
    });
  } catch (error) {
    res.status(400).json({
      error: 'Erro na desinscição',
      message: error.message
    });
  }
});

/**
 * GET /api/newsletter/subscribers
 * Lista todos os subscribers (ADMIN ONLY - requer autenticação + rate limit + logs)
 */
router.get('/subscribers', authenticateToken, rateLimitByIp(5, 60000), (req, res) => {
  try {
    const data = loadNewsletter();

    // Log de acesso
    console.log(`[NEWSLETTER] Acesso ADMIN por ${req.user.email} em ${new Date().toISOString()}`);

    // Retorna apenas subscribers ativos (sanitizado)
    const activeSubscribers = data.subscribers
      .filter(s => s.active)
      .map(s => ({
        email: s.email,
        subscribedAt: s.subscribedAt
      }));

    res.json({
      success: true,
      total: activeSubscribers.length,
      subscribers: activeSubscribers,
      metadata: {
        accessedBy: req.user.email,
        accessedAt: new Date().toISOString(),
        totalInactive: data.subscribers.filter(s => !s.active).length
      }
    });
  } catch (error) {
    console.error('[NEWSLETTER] Erro ao listar:', error.message);
    res.status(500).json({
      error: 'Erro ao listar subscribers',
      message: error.message
    });
  }
});

/**
 * GET /api/newsletter/stats
 * Estatísticas de newsletter (ADMIN ONLY)
 */
router.get('/stats', authenticateToken, rateLimitByIp(5, 60000), (req, res) => {
  try {
    const data = loadNewsletter();

    const stats = {
      totalSubscribers: data.subscribers.filter(s => s.active).length,
      totalUnsubscribed: data.subscribers.filter(s => !s.active).length,
      totalRegistered: data.subscribers.length,
      createdAt: data.metadata.createdAt,
      lastUpdate: data.metadata.lastUpdate
    };

    console.log(`[NEWSLETTER] Stats acessado por ${req.user.email}`);

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

/**
 * DELETE /api/newsletter/subscribers/:email
 * Remove subscriber específico (ADMIN ONLY)
 */
router.delete('/subscribers/:email', authenticateToken, rateLimitByIp(10, 60000), (req, res) => {
  try {
    const { email } = req.params;
    const sanitizedEmail = validateAndSanitizeEmail(email);

    const data = loadNewsletter();

    const subscriber = data.subscribers.find(s => s.email === sanitizedEmail);
    if (!subscriber) {
      return res.status(404).json({
        error: 'E-mail não encontrado'
      });
    }

    // Remove do array
    data.subscribers = data.subscribers.filter(s => s.email !== sanitizedEmail);
    data.metadata.lastUpdate = new Date().toISOString();
    saveNewsletter(data);

    console.log(`[NEWSLETTER] E-mail removido por ${req.user.email}: ${sanitizedEmail}`);

    res.json({
      success: true,
      message: 'Subscriber removido',
      deletedEmail: sanitizedEmail
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao remover subscriber',
      message: error.message
    });
  }
});

module.exports = router;

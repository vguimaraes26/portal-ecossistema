/**
 * NEWSLETTER DIGEST SERVICE
 * Gerencia digest semanal de artigos
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_FILE = path.join(__dirname, '../../..', 'articles.json');
const NEWSLETTER_FILE = path.join(__dirname, '../../..', 'newsletter.json');
const DIGESTS_FILE = path.join(__dirname, '../../..', 'digests.json');

/**
 * Carrega digests salvos
 */
function loadDigests() {
  try {
    if (!fs.existsSync(DIGESTS_FILE)) {
      return { digests: [], metadata: { createdAt: new Date().toISOString() } };
    }
    return JSON.parse(fs.readFileSync(DIGESTS_FILE, 'utf8'));
  } catch (error) {
    console.error('[DIGESTS] Erro ao carregar:', error.message);
    return { digests: [], metadata: { createdAt: new Date().toISOString() } };
  }
}

/**
 * Salva digests
 */
function saveDigests(data) {
  try {
    fs.writeFileSync(DIGESTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[DIGESTS] Erro ao salvar:', error.message);
    throw error;
  }
}

/**
 * Gera HTML do email de newsletter - DiF News
 * Design minimalista com detalhes sofisticados
 */
function generateNewsletterHTML(articles, options = {}) {
  const {
    title = 'Destaques da Semana',
    primaryColor = '#e8e8e8'
  } = options;

  const articlesHTML = articles
    .map(
      (article, index) => `
    <tr>
      <td style="padding: 32px 0; border-bottom: 1px solid ${primaryColor}18;">
        <div style="display: flex; gap: 16px;">
          <div style="color: ${primaryColor}; font-size: 20px; font-weight: 300; min-width: 20px;">
            ${String(index + 1).padStart(2, '0')}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">
              ${article.headline || article.original_title}
            </h3>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #666; line-height: 1.6;">
              ${article.content?.preview || ''}
            </p>
            <a href="#" style="color: ${primaryColor}; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
              LER ARTIGO →
            </a>
          </div>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #fafafa;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      padding: 48px 32px;
      text-align: center;
      border-bottom: 1px solid ${primaryColor}18;
    }
    .header-title {
      font-size: 32px;
      font-weight: 300;
      color: #1a1a1a;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .header-subtitle {
      font-size: 12px;
      color: #999;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }
    .header-accent {
      width: 40px;
      height: 2px;
      background: ${primaryColor};
      margin: 16px auto 0;
      opacity: 0.7;
    }
    .content {
      padding: 48px 32px;
    }
    .intro {
      font-size: 13px;
      color: #666;
      margin-bottom: 40px;
      line-height: 1.8;
    }
    .articles-table {
      width: 100%;
      border-collapse: collapse;
    }
    .cta-section {
      margin-top: 48px;
      text-align: center;
      padding-top: 40px;
      border-top: 1px solid ${primaryColor}18;
    }
    .cta-button {
      background: ${primaryColor};
      color: #000;
      padding: 14px 32px;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 1px;
      display: inline-block;
      border-radius: 2px;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .footer {
      background: #fafafa;
      padding: 32px;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #e8e8e8;
      letter-spacing: 0.5px;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
      margin: 0 8px;
    }
    .copyright {
      margin-top: 12px;
      color: #bbb;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="header-subtitle">DiF News</div>
      <h1 class="header-title">${title}</h1>
      <div class="header-accent"></div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <p class="intro">
        Olá. Aqui estão as notícias mais importantes da semana para o ecossistema contábil e financeiro.
      </p>

      <!-- ARTICLES -->
      <table class="articles-table">
        ${articlesHTML}
      </table>

      <!-- CTA -->
      <div class="cta-section">
        <a href="#" class="cta-button">Explorar Todas as Notícias</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-links">
        <a href="#">Preferências</a>
        <a href="#">Desinscrever</a>
      </div>
      <div class="copyright">
        © 2026 DiF News · Portal de Notícias para o Ecossistema Contábil
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Cria novo digest
 */
function createDigest(articleIds, options = {}) {
  try {
    // Carrega artigos
    if (!fs.existsSync(ARTICLES_FILE)) {
      throw new Error('Arquivo de artigos não encontrado');
    }

    const articlesData = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const selectedArticles = articlesData.articles.filter(a =>
      articleIds.includes(a.id)
    );

    if (selectedArticles.length === 0) {
      throw new Error('Nenhum artigo encontrado com os IDs fornecidos');
    }

    // Gera digest
    const digestId = `digest-${Date.now()}`;
    const html = generateNewsletterHTML(selectedArticles, options);

    const digest = {
      id: digestId,
      title: options.title || 'Digest Semanal',
      articleIds,
      articleCount: selectedArticles.length,
      html,
      createdAt: new Date().toISOString(),
      scheduledFor: options.scheduledFor || null,
      sent: false,
      sentAt: null,
      sentToCount: 0
    };

    // Salva
    const digests = loadDigests();
    digests.digests.push(digest);
    digests.metadata.lastUpdate = new Date().toISOString();
    saveDigests(digests);

    console.log(`[DIGESTS] Novo digest criado: ${digestId}`);

    return digest;
  } catch (error) {
    console.error('[DIGESTS] Erro ao criar digest:', error.message);
    throw error;
  }
}

/**
 * Lista digests
 */
function listDigests(limit = 10) {
  try {
    const digests = loadDigests();
    return digests.digests
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  } catch (error) {
    console.error('[DIGESTS] Erro ao listar digests:', error.message);
    return [];
  }
}

/**
 * Obtém digest por ID
 */
function getDigest(digestId) {
  try {
    const digests = loadDigests();
    return digests.digests.find(d => d.id === digestId);
  } catch (error) {
    console.error('[DIGESTS] Erro ao obter digest:', error.message);
    return null;
  }
}

/**
 * Marca digest como enviado
 */
function markDigestAsSent(digestId, sentToCount = 0) {
  try {
    const digests = loadDigests();
    const digest = digests.digests.find(d => d.id === digestId);

    if (!digest) {
      throw new Error('Digest não encontrado');
    }

    digest.sent = true;
    digest.sentAt = new Date().toISOString();
    digest.sentToCount = sentToCount;

    digests.metadata.lastUpdate = new Date().toISOString();
    saveDigests(digests);

    console.log(`[DIGESTS] Digest marcado como enviado: ${digestId}`);

    return digest;
  } catch (error) {
    console.error('[DIGESTS] Erro ao marcar como enviado:', error.message);
    throw error;
  }
}

/**
 * Deleta digest
 */
function deleteDigest(digestId) {
  try {
    const digests = loadDigests();
    const index = digests.digests.findIndex(d => d.id === digestId);

    if (index === -1) {
      throw new Error('Digest não encontrado');
    }

    const deleted = digests.digests.splice(index, 1)[0];
    digests.metadata.lastUpdate = new Date().toISOString();
    saveDigests(digests);

    console.log(`[DIGESTS] Digest deletado: ${digestId}`);

    return deleted;
  } catch (error) {
    console.error('[DIGESTS] Erro ao deletar digest:', error.message);
    throw error;
  }
}

/**
 * Gera HTML preview
 */
function generatePreview(articleIds, options = {}) {
  try {
    if (!fs.existsSync(ARTICLES_FILE)) {
      throw new Error('Arquivo de artigos não encontrado');
    }

    const articlesData = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const selectedArticles = articlesData.articles.filter(a =>
      articleIds.includes(a.id)
    );

    return generateNewsletterHTML(selectedArticles, options);
  } catch (error) {
    console.error('[DIGESTS] Erro ao gerar preview:', error.message);
    throw error;
  }
}

/**
 * Estatísticas de digests
 */
function getDigestStats() {
  try {
    const digests = loadDigests();
    const sent = digests.digests.filter(d => d.sent).length;
    const scheduled = digests.digests.filter(d => d.scheduledFor && !d.sent).length;
    const draft = digests.digests.filter(d => !d.sent && !d.scheduledFor).length;

    const totalSent = digests.digests.reduce((sum, d) => sum + (d.sentToCount || 0), 0);

    return {
      totalDigests: digests.digests.length,
      sent,
      scheduled,
      draft,
      totalSent,
      lastDigest: digests.digests[0]?.createdAt || null
    };
  } catch (error) {
    console.error('[DIGESTS] Erro ao obter stats:', error.message);
    return {};
  }
}

module.exports = {
  createDigest,
  listDigests,
  getDigest,
  markDigestAsSent,
  deleteDigest,
  generatePreview,
  generateNewsletterHTML,
  getDigestStats,
  loadDigests,
  saveDigests
};

const { getDatabase, saveDb } = require('./init');

function insertRawNews(newsData) {
  const db = getDatabase();
  const id = (db.news_raw.length > 0 ? Math.max(...db.news_raw.map(n => n.id)) : 0) + 1;
  const news = {
    id, title: newsData.title, url: newsData.url,
    content: newsData.summary || '', image: newsData.image || null,
    source: newsData.source, collected_at: new Date().toISOString()
  };
  db.news_raw.push(news);
  saveDb();
  return id;
}

function getRawNewsPending(limit = 50) {
  const db = getDatabase();
  const processedIds = new Set(db.news_processed.map(p => p.news_id));
  return db.news_raw.filter(n => !processedIds.has(n.id)).slice(0, limit);
}

function insertProcessedNews(newsData) {
  const db = getDatabase();
  const id = (db.news_processed.length > 0 ? Math.max(...db.news_processed.map(n => n.id)) : 0) + 1;
  const processed = {
    id, news_id: newsData.news_id, title: newsData.title, content: newsData.content,
    segment: newsData.segment, tone: newsData.tone, image_url: newsData.image_url,
    status: newsData.status || 'published', published_at: newsData.published_at
  };
  db.news_processed.push(processed);
  saveDb();
  return id;
}

function getPublishedNews(page = 1, limit = 10, segment = null) {
  const db = getDatabase();
  const offset = (page - 1) * limit;
  let filtered = db.news_processed.filter(np => np.status === 'published');
  if (segment && segment !== 'all') filtered = filtered.filter(np => np.segment === segment);
  filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  return filtered.slice(offset, offset + limit).map(np => {
    const raw = db.news_raw.find(r => r.id === np.news_id);
    return { ...np, source_url: raw ? raw.url : null };
  });
}

function getPublishedNewsCount(segment = null) {
  const db = getDatabase();
  let count = db.news_processed.filter(np => np.status === 'published');
  if (segment && segment !== 'all') count = count.filter(np => np.segment === segment);
  return count.length;
}

function getNewsById(id) {
  const db = getDatabase();
  const np = db.news_processed.find(n => n.id === id);
  if (!np) return null;
  const raw = db.news_raw.find(r => r.id === np.news_id);
  return { ...np, source_url: raw ? raw.url : null };
}

function updateNewsStatus(newsId, status) {
  const db = getDatabase();
  const news = db.news_processed.find(n => n.id === newsId);
  if (news) { news.status = status; saveDb(); }
  return news;
}

function getAllSegments() { return getDatabase().segments; }

function getSegmentStats() {
  const db = getDatabase();
  return db.segments.map(segment => ({
    segment: segment.name,
    count: db.news_processed.filter(np => np.status === 'published' && np.segment === segment.name).length
  }));
}

function insertProcessingLog(newsId, step, status, error = null) {
  const db = getDatabase();
  const log = {
    id: (db.processing_log.length > 0 ? Math.max(...db.processing_log.map(l => l.id)) : 0) + 1,
    news_id: newsId, step, status, error, processed_at: new Date().toISOString()
  };
  db.processing_log.push(log);
  saveDb();
  return log.id;
}

function getRecentLogs(limit = 50) {
  const db = getDatabase();
  return db.processing_log.sort((a, b) => new Date(b.processed_at) - new Date(a.processed_at)).slice(0, limit);
}

function getStats() {
  const db = getDatabase();
  const published = db.news_processed.filter(n => n.status === 'published');
  const today = new Date().toISOString().split('T')[0];
  const todayNews = published.filter(n => n.published_at.startsWith(today)).length;
  const bySegment = {};
  db.segments.forEach(seg => {
    bySegment[seg.name] = published.filter(n => n.segment === seg.name).length;
  });
  return { total: published.length, today: todayNews, bySegment };
}

function updateArticle(articleId, updatedData) {
  const fs = require('fs');
  const path = require('path');
  const versioningService = require('../services/versioningService');

  const ARTICLES_FILE = path.join(__dirname, '../../..', 'articles.json');

  try {
    // Carrega arquivo de artigos
    if (!fs.existsSync(ARTICLES_FILE)) {
      throw new Error('Arquivo de artigos não encontrado');
    }

    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    const article = data.articles.find(a => a.id === articleId);

    if (!article) {
      throw new Error('Artigo não encontrado');
    }

    // Faz backup da versão anterior
    const previousData = { ...article };

    // Atualiza campos permitidos
    const allowedFields = ['headline', 'body', 'segment', 'image', 'metadata', 'social'];
    allowedFields.forEach(field => {
      if (field in updatedData && updatedData[field] !== undefined) {
        article[field] = updatedData[field];
      }
    });

    // Atualiza metadados internos
    article.metadata.processed_at = new Date().toISOString();

    // Salva arquivo atualizado
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2));

    // Registra versão
    const version = versioningService.createVersion(articleId, previousData, article, 'edit', 'admin');

    console.log(`[MODELS] Artigo ${articleId} atualizado`);

    return { ...article, version };
  } catch (error) {
    console.error('[MODELS] Erro ao atualizar artigo:', error.message);
    throw error;
  }
}

module.exports = {
  insertRawNews, getRawNewsPending, insertProcessedNews, getPublishedNews, getPublishedNewsCount, getNewsById, updateNewsStatus,
  getAllSegments, getSegmentStats, insertProcessingLog, getRecentLogs, getStats, updateArticle
};

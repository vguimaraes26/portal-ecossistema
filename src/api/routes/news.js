const express = require('express');
const router = express.Router();
const { getPublishedNews, getPublishedNewsCount, getNewsById } = require('../../db/models');

router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const segment = req.query.segment || null;
    const news = getPublishedNews(page, limit, segment);
    const total = getPublishedNewsCount(segment);
    res.json({
      data: news.map(n => ({
        id: n.id, title: n.title, excerpt: n.content.substring(0, 150) + '...',
        segment: n.segment, tone: n.tone, image: n.image_url,
        publishedAt: n.published_at, sourceUrl: n.source_url
      })),
      meta: { total, page, pages: Math.ceil(total / limit), limit }
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const news = getNewsById(parseInt(req.params.id));
    if (!news) return res.status(404).json({ error: 'Notícia não encontrada' });
    res.json({
      id: news.id, title: news.title, content: news.content, segment: news.segment,
      tone: news.tone, image: news.image_url, sourceUrl: news.source_url, publishedAt: news.published_at
    });
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).json({ error: 'Erro ao buscar notícia' });
  }
});

module.exports = router;

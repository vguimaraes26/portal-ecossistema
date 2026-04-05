const express = require('express');
const router = express.Router();
const { getAllSegments, getSegmentStats, getPublishedNews, getPublishedNewsCount } = require('../../db/models');

router.get('/', (req, res) => {
  try {
    const segments = getAllSegments();
    const stats = getSegmentStats();
    const result = segments.map(seg => {
      const stat = stats.find(s => s.segment === seg.name) || { count: 0 };
      return { id: seg.id, name: seg.name, description: seg.description, count: stat.count };
    });
    res.json({ data: result });
  } catch (error) {
    console.error('Erro ao buscar segmentos:', error);
    res.status(500).json({ error: 'Erro ao buscar segmentos' });
  }
});

router.get('/:name/news', (req, res) => {
  try {
    const segment = req.params.name;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const segments = getAllSegments();
    if (!segments.find(s => s.name === segment)) {
      return res.status(404).json({ error: 'Segmento não encontrado' });
    }
    const news = getPublishedNews(page, limit, segment);
    const total = getPublishedNewsCount(segment);
    res.json({
      segment, data: news.map(n => ({
        id: n.id, title: n.title, image: n.image_url, publishedAt: n.published_at
      })),
      meta: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Erro ao buscar notícias do segmento:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias' });
  }
});

module.exports = router;

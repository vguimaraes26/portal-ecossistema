const express = require('express');
const router = express.Router();
const { getStats } = require('../../db/models');

router.get('/', (req, res) => {
  try {
    const stats = getStats();
    res.json({
      totalNews: stats.total, todayNews: stats.today, bySegment: stats.bySegment,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;

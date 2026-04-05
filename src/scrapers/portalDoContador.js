const axios = require('axios');
const { mockNews } = require('./mock');

async function scrapePortalDoContador() {
  console.log('📊 [Portal do Contador] Iniciando scrape...');
  let news = [];

  try {
    try {
      const response = await axios.get('https://www.portalconsultoria.com.br', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
    } catch (e) {
      console.log('   ⚠️  Erro de rede');
    }

    if (news.length === 0) {
      console.log('   ⚠️  Usando dados de teste (mock)');
      news = mockNews.portal.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
    }

    console.log(`✅ [Portal] ${news.length} notícias`);
    return news;
  } catch (error) {
    console.log(`   ⚠️  Retornando mock`);
    return mockNews.portal.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
  }
}

module.exports = { scrapePortalDoContador };

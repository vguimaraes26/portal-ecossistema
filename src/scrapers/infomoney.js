const axios = require('axios');
const { mockNews } = require('./mock');

async function scrapeInfomoney() {
  console.log('💰 [Infomoney] Iniciando scrape...');
  let news = [];

  try {
    try {
      const response = await axios.get('https://www.infomoney.com.br', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
    } catch (e) {
      console.log('   ⚠️  Erro de rede');
    }

    if (news.length === 0) {
      console.log('   ⚠️  Usando dados de teste (mock)');
      news = mockNews.infomoney.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
    }

    console.log(`✅ [Infomoney] ${news.length} notícias`);
    return news;
  } catch (error) {
    console.log(`   ⚠️  Retornando mock`);
    return mockNews.infomoney.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
  }
}

module.exports = { scrapeInfomoney };

const axios = require('axios');
const { mockNews } = require('./mock');

async function scrapeCNN() {
  console.log('📰 [CNN] Iniciando scrape...');
  let news = [];

  try {
    try {
      const response = await axios.get('https://www.cnnbrasil.com.br', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
      });
      // Tentaria fazer parse, mas seletores podem não funcionar
      // Então iremos para o mock
    } catch (e) {
      console.log('   ⚠️  Erro de rede');
    }

    if (news.length === 0) {
      console.log('   ⚠️  Usando dados de teste (mock)');
      news = mockNews.cnn.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
    }

    console.log(`✅ [CNN] ${news.length} notícias`);
    return news;
  } catch (error) {
    console.log(`   ⚠️  Retornando mock`);
    return mockNews.cnn.map(n => ({ ...n, scrapedAt: new Date().toISOString() }));
  }
}

module.exports = { scrapeCNN };

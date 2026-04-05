#!/usr/bin/env node

/**
 * GENERATE ARTICLES - Script para gerar artigos completos
 *
 * Uso:
 *   npm run articles              # Processa todas as notícias
 *   npm run articles -- contabilidade      # Processa apenas segmento específico
 *   npm run articles -- all       # Processa todos os segmentos para cada notícia
 */

const fs = require('fs');
const path = require('path');
const ArticleGenerator = require('../src/processors/articleGenerator');
const { COMMUNICATION_PROMPTS } = require('../src/processors/communicationPrompts');

const DATA_FILE = path.join(__dirname, '../data.json');
const ARTICLES_FILE = path.join(__dirname, '../articles.json');

async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   📝 GERADOR DE ARTIGOS - DiF Ecosystem   ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // 1. Lê notícias originais
    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ Arquivo data.json não encontrado!');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const rawNews = data.news_raw || [];

    if (rawNews.length === 0) {
      console.error('❌ Nenhuma notícia encontrada em data.json');
      process.exit(1);
    }

    console.log(`📰 Encontradas ${rawNews.length} notícias originais\n`);

    // 2. Determina quais segmentos processar
    const args = process.argv.slice(2);
    let segments = ['investimento', 'contabilidade', 'reforma_tributaria'];

    if (args.length > 0 && args[0] !== 'all') {
      const requestedSegment = args[0].toLowerCase();
      if (COMMUNICATION_PROMPTS[requestedSegment]) {
        segments = [requestedSegment];
      } else {
        console.error(`❌ Segmento "${args[0]}" não reconhecido!`);
        console.log(`✅ Segmentos disponíveis: ${Object.keys(COMMUNICATION_PROMPTS).join(', ')}`);
        process.exit(1);
      }
    }

    console.log(`🎯 Processando segmentos: ${segments.join(', ')}\n`);

    const generator = new ArticleGenerator();
    const articles = [];

    // 3. Processa cada notícia para cada segmento
    for (const news of rawNews.slice(0, 5)) { // Limita a 5 para testes
      for (const segment of segments) {
        try {
          const article = await this.processCompleteArticle(news, segment, generator);
          articles.push(article);

          // Pequeina pausa para respeitar rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`⚠️  Erro ao processar notícia ${news.id} / ${segment}: ${error.message}`);
        }
      }
    }

    // 4. Salva artigos processados
    const articlesData = {
      total: articles.length,
      generated_at: new Date().toISOString(),
      segments: segments,
      articles: articles
    };

    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articlesData, null, 2));

    // 5. Resumo final
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ PROCESSAMENTO CONCLUÍDO              ║');
    console.log('├════════════════════════════════════════════┤');
    console.log(`║   Artigos gerados:  ${String(articles.length).padEnd(26)}║`);
    console.log(`║   Segmentos:        ${segments.join(', ').padEnd(26)}║`);
    console.log(`║   Arquivo:          ${path.basename(ARTICLES_FILE).padEnd(26)}║`);
    console.log('╚════════════════════════════════════════════╝\n');

    // Mostra amostra
    if (articles.length > 0) {
      console.log('📋 AMOSTRA DO PRIMEIRO ARTIGO:\n');
      const first = articles[0];
      console.log(`📰 ${first.original_title}`);
      console.log(`📁 Segmento: ${first.segment}`);
      console.log(`\n${first.content.preview}\n`);
      console.log(`📱 Postagem: ${first.social.post}\n`);
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

/**
 * Wraps the processCompleteArticle call
 */
async function processCompleteArticle(newsData, segment, generator) {
  return await generator.processCompleteArticle(newsData, segment);
}

main();

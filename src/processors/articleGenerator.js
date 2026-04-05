/**
 * ARTICLE GENERATOR
 *
 * Gera artigos completos com comunicação customizada por segmento
 * - Reescreve conteúdo com tom de voz específico
 * - Gera postagem para redes sociais
 * - Mantém manchete original para referência
 */

const Anthropic = require('@anthropic-ai/sdk');
const { COMMUNICATION_PROMPTS } = require('./communicationPrompts');

class ArticleGenerator {
  constructor() {
    this.client = new Anthropic();
    this.model = 'claude-opus-4-6';
    this.max_tokens_article = 800;
    this.max_tokens_post = 200;
  }

  /**
   * Gera artigo completo com tom de voz customizado
   */
  async generateArticle(newsData, segment = 'investimento') {
    try {
      const segmentConfig = COMMUNICATION_PROMPTS[segment.toLowerCase()] || COMMUNICATION_PROMPTS.investimento;
      const content = newsData.content || '';

      // Prompt para o artigo completo
      const articlePrompt = segmentConfig.article_prompt.replace('{content}', content);

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.max_tokens_article,
        messages: [
          {
            role: 'user',
            content: articlePrompt
          }
        ]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error) {
      console.error('❌ Erro ao gerar artigo:', error.message);
      throw error;
    }
  }

  /**
   * Gera postagem para LinkedIn/redes sociais
   */
  async generatePost(newsData, segment = 'investimento', generatedArticle = '') {
    try {
      const segmentConfig = COMMUNICATION_PROMPTS[segment.toLowerCase()] || COMMUNICATION_PROMPTS.investimento;

      // Usa o artigo gerado ou o conteúdo original como contexto
      const context = generatedArticle || newsData.content;
      const postPrompt = `${segmentConfig.post_prompt}\n\nContexto: ${context.substring(0, 300)}...`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: this.max_tokens_post,
        messages: [
          {
            role: 'user',
            content: postPrompt
          }
        ]
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error) {
      console.error('❌ Erro ao gerar postagem:', error.message);
      throw error;
    }
  }

  /**
   * Processa notícia completa: artigo + postagem
   */
  async processCompleteArticle(newsData, segment = 'investimento') {
    try {
      console.log(`\n📝 Processando artigo: "${newsData.title}"`);
      console.log(`🎯 Segmento: ${segment}`);

      // 1. Gera artigo completo
      console.log('   → Gerando artigo com tom de voz...');
      const article = await this.generateArticle(newsData, segment);

      // 2. Gera postagem para redes sociais
      console.log('   → Gerando postagem...');
      const post = await this.generatePost(newsData, segment, article);

      // 3. Estrutura dados completos
      const completeArticle = {
        id: newsData.id,
        original_title: newsData.title,
        original_url: newsData.url,
        original_source: newsData.source,
        segment: segment,
        content: {
          headline: newsData.title,
          body: article,
          preview: article.substring(0, 150) + '...'
        },
        social: {
          post: post,
          hashtags: this.extractHashtags(post)
        },
        metadata: {
          processed_at: new Date().toISOString(),
          word_count: article.split(/\s+/).length,
          tone: COMMUNICATION_PROMPTS[segment].tone,
          keywords: COMMUNICATION_PROMPTS[segment].keywords
        },
        image: newsData.image,
        original_content: newsData.content
      };

      console.log(`   ✅ Artigo processado (${completeArticle.metadata.word_count} palavras)`);
      return completeArticle;
    } catch (error) {
      console.error('❌ Erro ao processar artigo completo:', error.message);
      throw error;
    }
  }

  /**
   * Extrai hashtags da postagem
   */
  extractHashtags(text) {
    const hashtags = (text.match(/#\w+/g) || []).slice(0, 5);
    return hashtags;
  }

  /**
   * Valida se o segmento é válido
   */
  isValidSegment(segment) {
    return Object.keys(COMMUNICATION_PROMPTS).includes(segment.toLowerCase());
  }

  /**
   * Retorna lista de segmentos disponíveis
   */
  getAvailableSegments() {
    return Object.keys(COMMUNICATION_PROMPTS);
  }

  /**
   * Retorna configuração de um segmento
   */
  getSegmentConfig(segment) {
    return COMMUNICATION_PROMPTS[segment.toLowerCase()] || null;
  }
}

module.exports = ArticleGenerator;

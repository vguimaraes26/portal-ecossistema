<template>
  <div class="article-viewer">
    <!-- HEADER -->
    <header class="viewer-header">
      <div class="header-content">
        <h1>📰 Portal DiF - Artigos Completos</h1>
        <p class="subtitle">Notícias com comunicação customizada por segmento</p>
      </div>
    </header>

    <!-- FILTROS -->
    <div class="filters">
      <button
        v-for="segment in availableSegments"
        :key="segment"
        :class="['filter-btn', { active: activeSegment === segment }]"
        @click="activeSegment = segment"
      >
        {{ getSegmentIcon(segment) }} {{ getSegmentName(segment) }}
      </button>
    </div>

    <!-- LOADING / EMPTY STATE -->
    <div v-if="loading" class="loading">
      <p>⏳ Carregando artigos...</p>
    </div>

    <div v-else-if="filteredArticles.length === 0" class="empty-state">
      <p>📭 Nenhum artigo encontrado para este segmento</p>
    </div>

    <!-- ARTIGOS -->
    <div v-else class="articles-grid">
      <article
        v-for="article in filteredArticles"
        :key="article.id"
        :class="['article-card', article.segment]"
        @click="selectedArticle = article"
      >
        <!-- IMAGEM -->
        <div class="article-image">
          <img :src="article.image" :alt="article.original_title" />
          <span class="segment-badge">{{ getSegmentIcon(article.segment) }}</span>
        </div>

        <!-- CONTEÚDO CARD -->
        <div class="article-content">
          <h3 class="article-title">{{ article.original_title }}</h3>
          <p class="article-preview">{{ article.content.preview }}</p>

          <div class="article-meta">
            <span class="source">{{ article.original_source }}</span>
            <span class="word-count">{{ article.metadata.word_count }} palavras</span>
          </div>

          <div class="article-actions">
            <button class="btn-read" @click.stop="selectedArticle = article">
              Ler Artigo →
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- MODAL - ARTIGO COMPLETO -->
    <div v-if="selectedArticle" class="modal-overlay" @click="selectedArticle = null">
      <div class="modal-content" @click.stop>
        <!-- CLOSE BUTTON -->
        <button class="close-btn" @click="selectedArticle = null">✕</button>

        <!-- ARTICLE FULL -->
        <article class="article-full">
          <!-- HEADER -->
          <div class="article-header">
            <div class="segment-info" :style="{ borderLeftColor: getDifColor(selectedArticle.segment) }">
              <span class="segment-label">{{ getSegmentIcon(selectedArticle.segment) }} {{ getSegmentName(selectedArticle.segment) }}</span>
              <h1>{{ selectedArticle.original_title }}</h1>
              <div class="meta-info">
                <span>📰 {{ selectedArticle.original_source }}</span>
                <span>⏱️ {{ formatDate(selectedArticle.metadata.processed_at) }}</span>
                <span>📊 {{ selectedArticle.metadata.word_count }} palavras</span>
              </div>
            </div>
          </div>

          <!-- IMAGEM -->
          <img v-if="selectedArticle.image" :src="selectedArticle.image" :alt="selectedArticle.original_title" class="article-image-full" />

          <!-- CONTEÚDO -->
          <div class="article-body">
            <div class="tone-indicator">
              <strong>🎯 Tom:</strong> {{ selectedArticle.metadata.tone }}
            </div>

            <div class="article-text" v-html="formatArticleText(selectedArticle.content.body)"></div>

            <!-- KEYWORDS -->
            <div v-if="selectedArticle.metadata.keywords" class="keywords">
              <strong>🏷️ Palavras-chave:</strong>
              <div class="keywords-list">
                <span v-for="keyword in selectedArticle.metadata.keywords" :key="keyword" class="keyword">
                  {{ keyword }}
                </span>
              </div>
            </div>
          </div>

          <!-- POSTAGEM SOCIAL -->
          <div class="social-section">
            <div class="social-header">
              <h3>📱 Postagem para Redes Sociais</h3>
              <button class="copy-btn" @click="copyToClipboard(selectedArticle.social.post)">
                Copiar
              </button>
            </div>
            <div class="social-post">
              <p>{{ selectedArticle.social.post }}</p>
              <div v-if="selectedArticle.social.hashtags" class="hashtags">
                <span v-for="tag in selectedArticle.social.hashtags" :key="tag" class="hashtag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- LINK ORIGINAL -->
          <div class="original-link">
            <a :href="selectedArticle.original_url" target="_blank" class="link-btn">
              🔗 Ver Notícia Original
            </a>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
const DIF_SEGMENTS = {
  contabilidade: {
    name: 'Contabilidade',
    icon: '📊',
    color: '#D4A041'
  },
  investimento: {
    name: 'Investimento',
    icon: '📈',
    color: '#D4A041'
  },
  reforma_tributaria: {
    name: 'Reforma Tributária',
    icon: '⚖️',
    color: '#D4A041'
  }
};

export default {
  name: 'ArticleViewer',
  data() {
    return {
      articles: [],
      selectedArticle: null,
      activeSegment: 'investimento',
      availableSegments: ['investimento', 'contabilidade', 'reforma_tributaria'],
      loading: true,
      error: null
    };
  },
  computed: {
    filteredArticles() {
      return this.articles.filter(a => a.segment === this.activeSegment);
    }
  },
  methods: {
    async loadArticles() {
      try {
        this.loading = true;
        const response = await fetch('/api/articles');
        const data = await response.json();
        this.articles = data.articles || [];
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    getSegmentName(segment) {
      return DIF_SEGMENTS[segment]?.name || segment;
    },
    getSegmentIcon(segment) {
      return DIF_SEGMENTS[segment]?.icon || '📄';
    },
    getDifColor(segment) {
      return DIF_SEGMENTS[segment]?.color || '#D4A041';
    },
    formatArticleText(text) {
      // Converte quebras de linha em parágrafos
      return text
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR');
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      alert('Postagem copiada!');
    }
  },
  mounted() {
    this.loadArticles();
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.article-viewer {
  background: #f9f9f9;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* HEADER */
.viewer-header {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  color: #D4A041;
  padding: 60px 20px;
  text-align: center;
  border-bottom: 3px solid #D4A041;
}

.viewer-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  font-size: 1.1rem;
  color: #ccc;
  font-weight: 300;
}

/* FILTROS */
.filters {
  display: flex;
  gap: 12px;
  padding: 30px 20px;
  justify-content: center;
  flex-wrap: wrap;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.filter-btn {
  padding: 12px 24px;
  border: 2px solid #D4A041;
  background: transparent;
  color: #D4A041;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(212, 160, 65, 0.1);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: #D4A041;
  color: #000;
  box-shadow: 0 4px 12px rgba(212, 160, 65, 0.3);
}

/* GRID DE ARTIGOS */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(212, 160, 65, 0.2);
  border-color: #D4A041;
}

.article-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: #f0f0f0;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.segment-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #D4A041;
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: 700;
}

.article-content {
  padding: 20px;
}

.article-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-preview {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.btn-read {
  width: 100%;
  padding: 12px;
  background: #D4A041;
  color: #000;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-read:hover {
  background: #B8860B;
  transform: translateX(2px);
}

/* EMPTY STATE */
.empty-state,
.loading {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.3rem;
  color: #999;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: sticky;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: #D4A041;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 12px 0 0;
  z-index: 10;
  float: right;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #B8860B;
  transform: rotate(90deg);
}

/* ARTICLE FULL */
.article-full {
  padding: 40px;
  color: #333;
}

.article-header {
  margin-bottom: 30px;
}

.segment-info {
  border-left: 4px solid #D4A041;
  padding-left: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.segment-label {
  display: inline-block;
  background: #D4A041;
  color: #000;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.article-full h1 {
  font-size: 2rem;
  margin: 12px 0;
  line-height: 1.3;
}

.meta-info {
  display: flex;
  gap: 20px;
  font-size: 0.95rem;
  color: #666;
  margin-top: 12px;
}

.article-image-full {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.article-body {
  margin: 30px 0;
}

.tone-indicator {
  background: rgba(212, 160, 65, 0.1);
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 3px solid #D4A041;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.article-text {
  line-height: 1.8;
  font-size: 1.05rem;
  color: #444;
}

.article-text p {
  margin-bottom: 16px;
  text-align: justify;
}

/* KEYWORDS */
.keywords {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin: 24px 0;
}

.keywords strong {
  display: block;
  margin-bottom: 12px;
  color: #D4A041;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword {
  background: #D4A041;
  color: #000;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* SOCIAL SECTION */
.social-section {
  background: #f0f0f0;
  padding: 24px;
  border-radius: 8px;
  margin: 30px 0;
}

.social-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.social-header h3 {
  color: #D4A041;
  font-size: 1.1rem;
}

.copy-btn {
  background: #D4A041;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #B8860B;
}

.social-post {
  background: #fff;
  padding: 16px;
  border-radius: 6px;
  border-left: 3px solid #D4A041;
}

.social-post p {
  line-height: 1.6;
  margin-bottom: 12px;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hashtag {
  color: #0066cc;
  font-weight: 600;
  font-size: 0.9rem;
}

/* ORIGINAL LINK */
.original-link {
  text-align: center;
  padding: 24px 0;
  border-top: 2px solid #e0e0e0;
  margin-top: 30px;
}

.link-btn {
  display: inline-block;
  background: #000;
  color: #D4A041;
  padding: 12px 30px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 2px solid #D4A041;
}

.link-btn:hover {
  background: #D4A041;
  color: #000;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .viewer-header h1 {
    font-size: 1.8rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 16px;
  }

  .article-full {
    padding: 20px;
  }

  .article-full h1 {
    font-size: 1.5rem;
  }

  .meta-info {
    flex-direction: column;
    gap: 8px;
  }

  .social-header {
    flex-direction: column;
    gap: 12px;
  }

  .copy-btn {
    width: 100%;
  }
}
</style>

<template>
  <div v-if="modelValue" class="seo-overlay" @click="closePanel">
    <div class="seo-panel" @click.stop>
      <!-- CLOSE BUTTON -->
      <button class="close-btn" @click="closePanel">✕</button>

      <!-- HEADER -->
      <div class="seo-header">
        <h2>🔍 SEO Helper</h2>
        <p class="seo-subtitle">Otimize seu artigo para melhor rankeamento</p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">
        <p>⏳ Analisando SEO...</p>
      </div>

      <!-- MAIN CONTENT -->
      <div v-else class="seo-content">
        <!-- SCORE SECTION -->
        <div class="score-section">
          <div class="score-circle">
            <div class="score-value" :class="scoreClass">
              {{ seoScore.percentage }}
            </div>
            <div class="score-label">SEO Score</div>
          </div>

          <div class="score-details">
            <p class="score-text">
              {{ scoreMessage }}
            </p>
            <div class="score-bar">
              <div class="score-fill" :style="{ width: seoScore.percentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- CHECKLIST -->
        <div class="checklist-section">
          <h3>📋 Checklist SEO</h3>

          <div class="checklist-items">
            <div
              v-for="(feedback, key) in seoScore.feedback"
              :key="key"
              :class="['checklist-item', feedback.status]"
            >
              <span class="status-icon">
                {{ feedback.status === 'ok' ? '✅' : feedback.status === 'warning' ? '⚠️' : '❌' }}
              </span>
              <div class="item-content">
                <span class="item-label">{{ formatLabel(key) }}</span>
                <span class="item-suggestion">{{ feedback.suggestion }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SUGGESTIONS -->
        <div v-if="suggestions.length > 0" class="suggestions-section">
          <h3>💡 Sugestões de Melhoria</h3>

          <div class="suggestions-list">
            <div
              v-for="(suggestion, index) in suggestions"
              :key="index"
              :class="['suggestion-card', `priority-${suggestion.priority}`]"
            >
              <div class="suggestion-header">
                <h4>{{ suggestion.title }}</h4>
                <span class="priority-badge">{{ getPriorityLabel(suggestion.priority) }}</span>
              </div>

              <p class="suggestion-description">{{ suggestion.description }}</p>

              <div class="suggestion-example">
                <strong>Exemplo:</strong>
                <code>{{ suggestion.example }}</code>
              </div>

              <div class="suggestion-action">
                <strong>Ação:</strong> {{ suggestion.action }}
              </div>
            </div>
          </div>
        </div>

        <!-- NO SUGGESTIONS -->
        <div v-else class="no-suggestions">
          <p>✨ Parabéns! Seu artigo está bem otimizado para SEO!</p>
        </div>

        <!-- READABILITY -->
        <div class="readability-section">
          <h3>📊 Legibilidade</h3>
          <div class="readability-score">
            <div class="readability-bar">
              <div class="readability-fill" :style="{ width: readability + '%' }"></div>
            </div>
            <p>Score: {{ readability }}/100</p>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="seo-actions">
        <button class="btn btn-primary" @click="applyAutoSuggestions" :disabled="loading">
          🚀 Aplicar Sugestões
        </button>
        <button class="btn btn-secondary" @click="closePanel">
          ✕ Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  article: {
    type: Object,
    required: false
  }
})

const emit = defineEmits(['update:modelValue', 'suggestions-applied'])

const loading = ref(false)
const seoScore = ref({
  score: 0,
  percentage: 0,
  feedback: {}
})
const suggestions = ref([])
const readability = ref(0)

const scoreClass = computed(() => {
  const p = seoScore.value.percentage
  if (p >= 80) return 'score-excellent'
  if (p >= 60) return 'score-good'
  if (p >= 40) return 'score-fair'
  return 'score-poor'
})

const scoreMessage = computed(() => {
  const p = seoScore.value.percentage
  if (p >= 80) return 'Excelente! Seu artigo está muito bem otimizado.'
  if (p >= 60) return 'Bom! Implemente as sugestões para melhorar ainda mais.'
  if (p >= 40) return 'Regular. Considere fazer melhorias importantes.'
  return 'Precisa de muitas melhorias. Siga as sugestões abaixo.'
})

onMounted(() => {
  if (props.article) {
    analyzeSEO()
  }
})

const analyzeSEO = () => {
  loading.value = true

  // Simula análise (em produção, seria uma chamada à API)
  setTimeout(() => {
    const article = props.article

    // Calcula score
    let score = 0
    const feedback = {}

    // Meta Title
    const headlineLen = article.headline?.length || 0
    if (headlineLen >= 50 && headlineLen <= 60) {
      score += 10
      feedback.metaTitle = { status: 'ok', suggestion: 'Meta title otimizado' }
    } else if (headlineLen > 0) {
      score += 5
      feedback.metaTitle = {
        status: 'warning',
        suggestion: `Headline com ${headlineLen} caracteres (50-60 ideal)`
      }
    } else {
      feedback.metaTitle = { status: 'error', suggestion: 'Headline obrigatório' }
    }

    // Meta Description
    const descLen = article.content?.preview?.length || 0
    if (descLen >= 150 && descLen <= 160) {
      score += 15
      feedback.metaDescription = { status: 'ok', suggestion: 'Descrição perfeita' }
    } else if (descLen > 0) {
      score += 7
      feedback.metaDescription = {
        status: 'warning',
        suggestion: `Descrição com ${descLen} caracteres (150-160 ideal)`
      }
    } else {
      feedback.metaDescription = { status: 'error', suggestion: 'Descrição obrigatória' }
    }

    // H1
    feedback.h1 = article.headline
      ? { status: 'ok', suggestion: 'H1 presente' }
      : { status: 'error', suggestion: 'H1 obrigatório' }
    if (article.headline) score += 10

    // Imagem
    if (article.image) {
      score += 10
      feedback.image = { status: 'ok', suggestion: 'Imagem adicionada' }
    } else {
      feedback.image = { status: 'error', suggestion: 'Adicione uma imagem' }
    }

    // Keywords
    const keywordCount = article.metadata?.keywords?.length || 0
    if (keywordCount >= 3) {
      score += 15
      feedback.keywords = { status: 'ok', suggestion: `${keywordCount} keywords` }
    } else if (keywordCount > 0) {
      score += 7
      feedback.keywords = {
        status: 'warning',
        suggestion: `${keywordCount} keywords (mínimo 3)`
      }
    } else {
      feedback.keywords = { status: 'error', suggestion: 'Adicione keywords' }
    }

    // Word Count
    const wordCount = article.metadata?.word_count || 0
    if (wordCount >= 300 && wordCount <= 2000) {
      score += 15
      feedback.wordCount = { status: 'ok', suggestion: `${wordCount} palavras` }
    } else if (wordCount >= 150) {
      score += 8
      feedback.wordCount = {
        status: 'warning',
        suggestion: `${wordCount} palavras (300-2000 ideal)`
      }
    } else {
      feedback.wordCount = {
        status: 'error',
        suggestion: `${wordCount} palavras (muito pouco)`
      }
    }

    // Slug
    feedback.slug = article.slug
      ? { status: 'ok', suggestion: 'Slug otimizado' }
      : { status: 'error', suggestion: 'Slug obrigatório' }
    if (article.slug) score += 5

    // Links Internos
    const linkCount = article.content?.body?.match(/\[.*?\]\(\/.*?\)/g)?.length || 0
    if (linkCount >= 2) {
      score += 10
      feedback.links = { status: 'ok', suggestion: `${linkCount} links internos` }
    } else if (linkCount > 0) {
      score += 5
      feedback.links = {
        status: 'warning',
        suggestion: `${linkCount} link (mínimo 2)`
      }
    } else {
      feedback.links = { status: 'error', suggestion: 'Adicione links internos' }
    }

    seoScore.value = {
      score: Math.min(score, 100),
      percentage: Math.round((score / 100) * 100),
      feedback
    }

    // Gera sugestões
    const sug = []
    if (headlineLen < 50) {
      sug.push({
        priority: 'high',
        title: '📝 Headline Curto',
        description: 'Expanda para 50-60 caracteres',
        example: `${article.headline} | DiF Portugal`,
        action: 'Edite o headline'
      })
    }
    if (keywordCount < 3) {
      sug.push({
        priority: 'high',
        title: '🏷️ Keywords',
        description: 'Adicione 3+ keywords',
        example: 'investimento, mercado, oportunidade',
        action: 'Identifique termos principais'
      })
    }
    if (wordCount < 300) {
      sug.push({
        priority: 'high',
        title: '📄 Conteúdo Curto',
        description: `Expanda de ${wordCount} para 300+ palavras`,
        example: 'Adicione análise e detalhes',
        action: 'Expanda o corpo do artigo'
      })
    }
    suggestions.value = sug

    // Legibilidade
    readability.value = Math.max(0, Math.min(100, 50 + wordCount / 20))

    loading.value = false
  }, 500)
}

const formatLabel = (key) => {
  const labels = {
    metaTitle: 'Meta Title',
    metaDescription: 'Meta Description',
    h1: 'H1 Tag',
    image: 'Imagem',
    keywords: 'Keywords',
    wordCount: 'Word Count',
    slug: 'Slug',
    links: 'Links Internos'
  }
  return labels[key] || key
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: '🔴 Alto',
    medium: '🟡 Médio',
    low: '🟢 Baixo'
  }
  return labels[priority] || priority
}

const applyAutoSuggestions = () => {
  emit('suggestions-applied', suggestions.value)
}

const closePanel = () => emit('update:modelValue', false)
</script>

<style scoped>
.seo-overlay {
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
}

.seo-panel {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  backdrop-filter: blur(10px);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #e8e8e8;
  z-index: 10;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.seo-header {
  margin-bottom: 25px;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 15px;
}

.seo-header h2 {
  color: #e8e8e8;
  margin: 0 0 5px 0;
}

.seo-subtitle {
  color: #999;
  margin: 0;
  font-size: 12px;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.seo-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.score-section {
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 20px;
  background: rgba(232, 232, 232, 0.08);
  border-radius: 8px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: #e8e8e8;
}

.score-value.score-excellent {
  color: #4CAF50;
}

.score-value.score-good {
  color: #8BC34A;
}

.score-value.score-fair {
  color: #FFC107;
}

.score-value.score-poor {
  color: #FF6B6B;
}

.score-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.score-details {
  flex: 1;
}

.score-text {
  color: #bbb;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.score-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #e8e8e8 0%, #8BC34A 100%);
  transition: width 0.5s ease;
}

.checklist-section h3,
.suggestions-section h3,
.readability-section h3 {
  color: #e8e8e8;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 3px solid #e8e8e8;
}

.checklist-item.error {
  border-left-color: #FF6B6B;
}

.checklist-item.warning {
  border-left-color: #FFC107;
}

.checklist-item.ok {
  border-left-color: #4CAF50;
}

.status-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-label {
  color: #e8e8e8;
  font-weight: 600;
  font-size: 13px;
}

.item-suggestion {
  color: #999;
  font-size: 12px;
}

.suggestions-section {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-left: 4px solid #e8e8e8;
  border-radius: 4px;
}

.suggestion-card.priority-high {
  border-left-color: #FF6B6B;
}

.suggestion-card.priority-medium {
  border-left-color: #FFC107;
}

.suggestion-card.priority-low {
  border-left-color: #4CAF50;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.suggestion-header h4 {
  color: #e8e8e8;
  margin: 0;
  font-size: 13px;
}

.priority-badge {
  font-size: 11px;
  color: #999;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.suggestion-description {
  color: #bbb;
  font-size: 12px;
  margin: 0 0 8px 0;
}

.suggestion-example {
  margin: 8px 0;
  padding: 8px;
  background: rgba(10, 10, 10, 0.5);
  border-radius: 3px;
}

.suggestion-example strong {
  color: #e8e8e8;
  font-size: 11px;
}

.suggestion-example code {
  display: block;
  color: #88ff88;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  margin-top: 4px;
}

.suggestion-action {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.suggestion-action strong {
  color: #e8e8e8;
}

.no-suggestions {
  text-align: center;
  padding: 30px 20px;
  color: #4CAF50;
  font-size: 14px;
}

.readability-section {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.readability-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.readability-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFC107 0%, #4CAF50 100%);
}

.readability-score p {
  margin: 0;
  color: #999;
  font-size: 12px;
}

.seo-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #e8e8e8 0%, #cccccc 100%);
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 232, 232, 0.3);
}

.btn-secondary {
  background: rgba(100, 100, 100, 0.3);
  color: #ccc;
  border: 1px solid #666;
}

.btn-secondary:hover {
  background: rgba(100, 100, 100, 0.5);
}

@media (max-width: 768px) {
  .seo-panel {
    max-width: 100%;
    padding: 20px;
  }

  .score-section {
    flex-direction: column;
    gap: 15px;
  }

  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-value {
    font-size: 28px;
  }
}
</style>

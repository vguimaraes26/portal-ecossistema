<template>
  <div class="newsletter-digest-page">
    <!-- HEADER -->
    <div class="page-header">
      <h1>DiF News</h1>
      <p class="subtitle">Boletim minimalista e sofisticado para seu ecossistema</p>
    </div>

    <!-- TAB NAVIGATION -->
    <div class="tabs-container">
      <button
        :class="['tab-btn', { active: activeTab === 'create' }]"
        @click="activeTab = 'create'"
      >
        ✨ Criar Digest
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'"
      >
        📋 Meus Digests
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'stats' }]"
        @click="activeTab = 'stats'"
      >
        📊 Estatísticas
      </button>
    </div>

    <!-- CREATE TAB -->
    <div v-if="activeTab === 'create'" class="tab-content">
      <div class="create-section">
        <!-- LEFT: SELECTION -->
        <div class="create-left">
          <h3>1️⃣ Selecione Artigos</h3>
          <div class="articles-filter">
            <select v-model="filterSegment" class="filter-select">
              <option value="">Todos os segmentos</option>
              <option value="investimento">💰 Investimento</option>
              <option value="contabilidade">📊 Contabilidade</option>
              <option value="gestao">🏢 Gestão</option>
              <option value="reforma_tributaria">⚖️ Reforma Tributária</option>
              <option value="ia_otimizacao">🤖 IA & Otimização</option>
            </select>
          </div>

          <div v-if="loading" class="loading">Carregando artigos...</div>

          <div v-else class="articles-list">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              :class="['article-item', { selected: isArticleSelected(article.id) }]"
              @click="toggleArticleSelection(article.id)"
            >
              <input
                type="checkbox"
                :checked="isArticleSelected(article.id)"
                @change.stop
              />
              <div class="article-info">
                <strong>{{ article.headline || article.original_title }}</strong>
                <span class="segment-badge">{{ getSegmentLabel(article.segment) }}</span>
              </div>
            </div>
          </div>

          <div class="selection-info">
            <p>{{ selectedArticles.length }} artigos selecionados</p>
          </div>
        </div>

        <!-- RIGHT: PREVIEW -->
        <div class="create-right">
          <h3>2️⃣ Preview do Digest</h3>

          <div class="preview-form">
            <div class="form-group">
              <label>Título do Digest</label>
              <input
                v-model="digestForm.title"
                type="text"
                placeholder="Ex: Destaques da Semana"
              />
            </div>

            <div class="form-group">
              <label>Agendar para (opcional)</label>
              <input
                v-model="digestForm.scheduledDate"
                type="datetime-local"
                placeholder="Terça 9AM"
              />
              <p class="hint">Terça-feira 9:00 AM (Brasília) recomendado</p>
            </div>
          </div>

          <!-- PREVIEW IFRAME -->
          <div v-if="selectedArticles.length > 0" class="preview-container">
            <button class="btn btn-primary" @click="generatePreview" :disabled="previewLoading">
              {{ previewLoading ? '⏳ Gerando...' : '🔍 Visualizar Email' }}
            </button>

            <div v-if="previewHTML" class="preview-email">
              <iframe
                :srcdoc="previewHTML"
                class="preview-iframe"
              />
            </div>
          </div>

          <div v-else class="no-selection">
            <p>Selecione artigos para visualizar o digest</p>
          </div>

          <!-- ACTIONS -->
          <div class="create-actions">
            <button
              class="btn btn-primary"
              @click="createDigest"
              :disabled="selectedArticles.length === 0 || creatingDigest"
            >
              {{ creatingDigest ? '⏳ Criando...' : '✅ Criar Digest' }}
            </button>
            <button class="btn btn-secondary" @click="resetForm">
              ↺ Limpar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- LIST TAB -->
    <div v-if="activeTab === 'list'" class="tab-content">
      <div v-if="digestLoading" class="loading">Carregando digests...</div>

      <div v-else-if="digests.length === 0" class="empty-state">
        <p>📭 Nenhum digest criado ainda</p>
      </div>

      <div v-else class="digests-list">
        <div v-for="digest in digests" :key="digest.id" class="digest-card">
          <div class="digest-header">
            <h4>{{ digest.title }}</h4>
            <span :class="['digest-status', digest.sent ? 'sent' : 'draft']">
              {{ digest.sent ? '✅ Enviado' : '📝 Rascunho' }}
            </span>
          </div>

          <div class="digest-info">
            <p><strong>Artigos:</strong> {{ digest.articleCount }}</p>
            <p><strong>Criado:</strong> {{ formatDate(digest.createdAt) }}</p>
            <p v-if="digest.sent">
              <strong>Enviado para:</strong> {{ digest.sentToCount }} subscribers
            </p>
            <p v-else-if="digest.scheduledFor">
              <strong>Agendado para:</strong> {{ formatDate(digest.scheduledFor) }}
            </p>
          </div>

          <div class="digest-actions">
            <button class="btn-small" @click="viewDigest(digest)">
              👁️ Visualizar
            </button>
            <button
              v-if="!digest.sent"
              class="btn-small"
              @click="sendDigest(digest.id)"
            >
              📧 Enviar Agora
            </button>
            <button class="btn-small btn-danger" @click="deleteDigest(digest.id)">
              🗑️ Deletar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- STATS TAB -->
    <div v-if="activeTab === 'stats'" class="tab-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h4>📊 Total de Digests</h4>
          <p class="stat-value">{{ stats.totalDigests || 0 }}</p>
        </div>

        <div class="stat-card">
          <h4>✅ Enviados</h4>
          <p class="stat-value">{{ stats.sent || 0 }}</p>
        </div>

        <div class="stat-card">
          <h4>⏰ Agendados</h4>
          <p class="stat-value">{{ stats.scheduled || 0 }}</p>
        </div>

        <div class="stat-card">
          <h4>📝 Rascunhos</h4>
          <p class="stat-value">{{ stats.draft || 0 }}</p>
        </div>

        <div class="stat-card">
          <h4>👥 Total Enviado Para</h4>
          <p class="stat-value">{{ stats.totalSent || 0 }}</p>
        </div>

        <div class="stat-card">
          <h4>📅 Último Digest</h4>
          <p class="stat-value" style="font-size: 12px;">
            {{ stats.lastDigest ? formatDate(stats.lastDigest) : 'Nenhum' }}
          </p>
        </div>
      </div>
    </div>

    <!-- MESSAGES -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <div v-if="successMessage" class="success-message">
      ✅ {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const activeTab = ref('create')
const articles = ref([])
const selectedArticles = ref([])
const digests = ref([])
const stats = ref({})
const loading = ref(false)
const digestLoading = ref(false)
const previewLoading = ref(false)
const creatingDigest = ref(false)
const filterSegment = ref('')
const error = ref(null)
const successMessage = ref(null)
const previewHTML = ref(null)

const digestForm = ref({
  title: 'Destaques da Semana',
  scheduledDate: null
})

const filteredArticles = computed(() => {
  if (!filterSegment.value) return articles.value
  return articles.value.filter(a => a.segment === filterSegment.value)
})

const segmentLabels = {
  'contabilidade': '📊 Contabilidade',
  'investimento': '💰 Investimento',
  'reforma_tributaria': '⚖️ Reforma Tributária',
  'gestao': '🏢 Gestão',
  'ia_otimizacao': '🤖 IA & Otimização'
}

onMounted(() => {
  loadArticles()
  loadDigests()
  loadStats()
})

const loadArticles = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/articles')
    articles.value = response.data.articles || []
  } catch (err) {
    error.value = 'Erro ao carregar artigos'
    console.error('[Newsletter] Erro:', err)
  } finally {
    loading.value = false
  }
}

const loadDigests = async () => {
  digestLoading.value = true
  try {
    const response = await axios.get('/api/newsletter-digest')
    digests.value = response.data.digests || []
  } catch (err) {
    console.error('[Newsletter] Erro:', err)
  } finally {
    digestLoading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await axios.get('/api/newsletter-digest/stats/summary')
    stats.value = response.data.stats || {}
  } catch (err) {
    console.error('[Newsletter] Erro:', err)
  }
}

const isArticleSelected = (articleId) => {
  return selectedArticles.value.includes(articleId)
}

const toggleArticleSelection = (articleId) => {
  if (isArticleSelected(articleId)) {
    selectedArticles.value = selectedArticles.value.filter(id => id !== articleId)
  } else {
    selectedArticles.value.push(articleId)
  }
}

const generatePreview = async () => {
  previewLoading.value = true
  error.value = null

  try {
    const response = await axios.post('/api/newsletter-digest/preview', {
      articleIds: selectedArticles.value,
      options: { title: digestForm.value.title }
    })

    previewHTML.value = response.data.html
  } catch (err) {
    error.value = 'Erro ao gerar preview'
    console.error('[Newsletter] Erro:', err)
  } finally {
    previewLoading.value = false
  }
}

const createDigest = async () => {
  creatingDigest.value = true
  error.value = null
  successMessage.value = null

  try {
    await axios.post('/api/newsletter-digest/create', {
      articleIds: selectedArticles.value,
      title: digestForm.value.title,
      scheduledFor: digestForm.value.scheduledDate
    })

    successMessage.value = 'Digest criado com sucesso!'
    resetForm()
    loadDigests()
    loadStats()

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao criar digest'
    console.error('[Newsletter] Erro:', err)
  } finally {
    creatingDigest.value = false
  }
}

const resetForm = () => {
  selectedArticles.value = []
  digestForm.value = {
    title: '📰 Destaques da Semana',
    scheduledDate: null
  }
  previewHTML.value = null
  filterSegment.value = ''
}

const sendDigest = async (digestId) => {
  try {
    await axios.post(`/api/newsletter-digest/${digestId}/send`, {
      sentToCount: 100 // Simula contagem
    })

    successMessage.value = 'Digest enviado com sucesso!'
    loadDigests()
    loadStats()
  } catch (err) {
    error.value = 'Erro ao enviar digest'
    console.error('[Newsletter] Erro:', err)
  }
}

const deleteDigest = async (digestId) => {
  if (!confirm('Tem certeza que deseja deletar este digest?')) return

  try {
    await axios.delete(`/api/newsletter-digest/${digestId}`)
    successMessage.value = 'Digest deletado com sucesso!'
    loadDigests()
    loadStats()
  } catch (err) {
    error.value = 'Erro ao deletar digest'
    console.error('[Newsletter] Erro:', err)
  }
}

const viewDigest = (digest) => {
  previewHTML.value = digest.html
  window.scrollTo(0, 0)
}

const getSegmentLabel = (segment) => {
  return segmentLabels[segment] || segment
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.newsletter-digest-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
  padding: 40px 20px;
  color: #ccc;
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 20px;
}

.page-header h1 {
  color: #e8e8e8;
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.subtitle {
  color: #999;
  margin: 0;
}

.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.tab-btn {
  background: rgba(232, 232, 232, 0.1);
  border: 2px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(232, 232, 232, 0.2);
  border-color: rgba(232, 232, 232, 0.6);
}

.tab-btn.active {
  background: rgba(232, 232, 232, 0.3);
  border-color: #e8e8e8;
  box-shadow: 0 0 15px rgba(232, 232, 232, 0.3);
}

.tab-content {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.create-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.create-left,
.create-right {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.create-left h3,
.create-right h3 {
  color: #e8e8e8;
  margin: 0 0 15px 0;
}

.articles-filter {
  display: flex;
  gap: 10px;
}

.filter-select {
  flex: 1;
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  padding: 10px;
  border-radius: 6px;
}

.articles-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 6px;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid rgba(232, 232, 232, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.article-item:hover {
  background: rgba(232, 232, 232, 0.08);
}

.article-item.selected {
  background: rgba(232, 232, 232, 0.15);
}

.article-item input {
  cursor: pointer;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.article-info strong {
  color: #e8e8e8;
  font-size: 13px;
}

.segment-badge {
  font-size: 11px;
  color: #999;
}

.selection-info {
  padding: 10px;
  background: rgba(232, 232, 232, 0.08);
  border-radius: 6px;
  text-align: center;
  color: #e8e8e8;
  font-weight: 600;
}

.preview-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #e8e8e8;
  font-weight: 600;
  font-size: 13px;
}

.form-group input {
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #ccc;
  padding: 8px;
  border-radius: 4px;
}

.hint {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.preview-container {
  margin-top: 20px;
}

.preview-iframe {
  width: 100%;
  height: 400px;
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 6px;
  background: white;
  margin-top: 12px;
}

.no-selection {
  text-align: center;
  padding: 30px;
  color: #999;
}

.create-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
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
  background: linear-gradient(135deg, #e8e8e8 0%, #c99e2c 100%);
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

.digests-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.digest-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 8px;
  padding: 15px;
}

.digest-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.digest-header h4 {
  color: #e8e8e8;
  margin: 0;
  flex: 1;
}

.digest-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 3px;
  font-weight: 600;
}

.digest-status.sent {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.digest-status.draft {
  background: rgba(255, 193, 7, 0.2);
  color: #FFC107;
}

.digest-info {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.digest-info p {
  margin: 4px 0;
}

.digest-info strong {
  color: #e8e8e8;
}

.digest-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  flex: 1;
  padding: 6px 10px;
  background: rgba(232, 232, 232, 0.1);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-small:hover {
  background: rgba(232, 232, 232, 0.2);
}

.btn-small.btn-danger {
  background: rgba(255, 100, 100, 0.1);
  border-color: rgba(255, 100, 100, 0.3);
  color: #ff6666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-card h4 {
  color: #e8e8e8;
  margin: 0 0 12px 0;
  font-size: 13px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #e8e8e8;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.1rem;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border-left: 3px solid #ff4444;
  color: #ffaaaa;
  padding: 15px;
  margin-top: 20px;
  border-radius: 4px;
}

.success-message {
  background: rgba(0, 255, 0, 0.1);
  border-left: 3px solid #44ff44;
  color: #88ff88;
  padding: 15px;
  margin-top: 20px;
  border-radius: 4px;
}

@media (max-width: 1024px) {
  .create-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .digests-list {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

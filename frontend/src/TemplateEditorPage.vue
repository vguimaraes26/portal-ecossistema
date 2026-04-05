<template>
  <div class="template-editor-page">
    <!-- HEADER -->
    <div class="page-header">
      <h1>📝 Editor de Templates</h1>
      <p class="subtitle">Customize templates por segmento para seus posts</p>
    </div>

    <!-- TAB NAVIGATION -->
    <div class="tabs-container">
      <button
        v-for="template in templates"
        :key="template.id"
        :class="['tab-button', { active: activeTemplate?.id === template.id }]"
        @click="selectTemplate(template)"
      >
        {{ getSegmentIcon(template.segment) }} {{ template.name }}
      </button>
    </div>

    <!-- LOADING / EMPTY STATE -->
    <div v-if="loading" class="loading-state">
      <p>⏳ Carregando templates...</p>
    </div>

    <div v-else-if="templates.length === 0" class="empty-state">
      <p>📭 Nenhum template encontrado</p>
    </div>

    <!-- EDITOR SECTION -->
    <div v-else-if="activeTemplate" class="editor-section">
      <!-- LEFT: EDIT FORM -->
      <div class="editor-left">
        <div class="form-group">
          <label>Nome do Template</label>
          <input v-model="editedTemplate.name" type="text" placeholder="Ex: Análise de Mercado" />
        </div>

        <div class="form-group">
          <label>Descrição</label>
          <textarea
            v-model="editedTemplate.description"
            placeholder="Descrição do template"
            rows="2"
          />
        </div>

        <div class="form-group">
          <label>Segmento</label>
          <input v-model="editedTemplate.segment" type="text" disabled class="disabled-input" />
        </div>

        <div class="form-group">
          <label>Conteúdo do Template</label>
          <textarea
            v-model="editedTemplate.content"
            placeholder="Use {placeholder} para variáveis&#10;Exemplo: {headline}, {body}, {keywords}, {tone}, {author}"
            rows="10"
            class="template-textarea"
          />
          <p class="hint">💡 Use placeholders: {headline}, {body}, {keywords}, {tone}, {author}, {segment}</p>
        </div>

        <div class="form-group">
          <label>Exemplo de Saída</label>
          <textarea
            v-model="editedTemplate.example"
            placeholder="Exemplo de como o template ficará"
            rows="6"
          />
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="saveTemplate" :disabled="saving">
            {{ saving ? '⏳ Salvando...' : '💾 Salvar Template' }}
          </button>
          <button class="btn btn-secondary" @click="resetForm">
            ↺ Cancelar
          </button>
        </div>
      </div>

      <!-- RIGHT: PREVIEW -->
      <div class="editor-right">
        <div class="preview-card">
          <h3>👁️ Preview</h3>

          <!-- Test Variables Input -->
          <div class="test-variables">
            <h4>Variáveis de Teste:</h4>
            <input
              v-model="testVars.headline"
              type="text"
              placeholder="Headline"
              class="test-input"
            />
            <input
              v-model="testVars.body"
              type="text"
              placeholder="Body"
              class="test-input"
            />
            <input
              v-model="testVars.keywords"
              type="text"
              placeholder="Keywords"
              class="test-input"
            />
            <select v-model="testVars.tone" class="test-input">
              <option value="profissional">Profissional</option>
              <option value="casual">Casual</option>
              <option value="executivo">Executivo</option>
              <option value="tecnico">Técnico</option>
            </select>
            <input
              v-model="testVars.author"
              type="text"
              placeholder="Author"
              class="test-input"
            />
          </div>

          <!-- Preview Output -->
          <div class="preview-output">
            <div v-if="previewResult" class="output-box">
              {{ previewResult }}
            </div>
            <div v-else class="placeholder-output">
              <p>Preencha as variáveis acima para ver o preview</p>
            </div>
          </div>

          <!-- Info -->
          <div class="template-info">
            <p><strong>Segmento:</strong> {{ getSegmentLabel(activeTemplate.segment) }}</p>
            <p><strong>Criado:</strong> {{ formatDate(activeTemplate.createdAt) }}</p>
            <p v-if="activeTemplate.updatedAt">
              <strong>Atualizado:</strong> {{ formatDate(activeTemplate.updatedAt) }}
            </p>
            <p><strong>Placeholders:</strong> {{ editedTemplate.placeholders.join(', ') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ERROR MESSAGE -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- SUCCESS MESSAGE -->
    <div v-if="successMessage" class="success-message">
      ✅ {{ successMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const templates = ref([])
const activeTemplate = ref(null)
const editedTemplate = ref({})
const loading = ref(false)
const saving = ref(false)
const error = ref(null)
const successMessage = ref(null)

const testVars = ref({
  headline: 'Título do Artigo Aqui',
  body: 'Conteúdo principal do artigo...',
  keywords: 'palavra-chave1, palavra-chave2',
  tone: 'profissional',
  author: 'João Silva'
})

const segmentLabels = {
  'contabilidade': '📊 Contabilidade',
  'investimento': '💰 Investimento',
  'reforma_tributaria': '⚖️ Reforma Tributária',
  'gestao': '🏢 Gestão',
  'ia_otimizacao': '🤖 IA & Otimização'
}

const segmentIcons = {
  'contabilidade': '📊',
  'investimento': '💰',
  'reforma_tributaria': '⚖️',
  'gestao': '🏢',
  'ia_otimizacao': '🤖'
}

const previewResult = computed(() => {
  if (!editedTemplate.value.content) return ''

  let result = editedTemplate.value.content
  result = result.replace(/{headline}/g, testVars.value.headline)
  result = result.replace(/{body}/g, testVars.value.body)
  result = result.replace(/{keywords}/g, testVars.value.keywords)
  result = result.replace(/{tone}/g, testVars.value.tone)
  result = result.replace(/{author}/g, testVars.value.author)
  result = result.replace(/{segment}/g, getSegmentLabel(activeTemplate.value.segment))

  return result
})

onMounted(() => {
  loadTemplates()
})

const loadTemplates = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get('/api/templates')
    templates.value = response.data.templates || []

    if (templates.value.length > 0) {
      selectTemplate(templates.value[0])
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro ao carregar templates'
    console.error('[TemplateEditor] Erro:', err)
  } finally {
    loading.value = false
  }
}

const selectTemplate = (template) => {
  activeTemplate.value = template
  editedTemplate.value = JSON.parse(JSON.stringify(template))
}

const resetForm = () => {
  if (activeTemplate.value) {
    editedTemplate.value = JSON.parse(JSON.stringify(activeTemplate.value))
  }
}

const saveTemplate = async () => {
  if (!editedTemplate.value.name || !editedTemplate.value.content) {
    error.value = 'Nome e conteúdo são obrigatórios'
    return
  }

  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await axios.patch(
      `/api/templates/${activeTemplate.value.id}`,
      editedTemplate.value
    )

    activeTemplate.value = response.data.template
    successMessage.value = 'Template salvo com sucesso!'

    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro ao salvar template'
    console.error('[TemplateEditor] Erro ao salvar:', err)
  } finally {
    saving.value = false
  }
}

const getSegmentLabel = (segment) => {
  return segmentLabels[segment] || segment
}

const getSegmentIcon = (segment) => {
  return segmentIcons[segment] || '📄'
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
.template-editor-page {
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

.page-header .subtitle {
  color: #999;
  margin: 0;
}

.tabs-container {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab-button {
  background: rgba(232, 232, 232, 0.1);
  border: 2px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.tab-button:hover {
  background: rgba(232, 232, 232, 0.2);
  border-color: rgba(232, 232, 232, 0.6);
}

.tab-button.active {
  background: rgba(232, 232, 232, 0.3);
  border-color: #e8e8e8;
  box-shadow: 0 0 15px rgba(232, 232, 232, 0.3);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 1.2rem;
}

.editor-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.editor-left,
.editor-right {
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 12px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #e8e8e8;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #ccc;
  padding: 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #e8e8e8;
  box-shadow: 0 0 10px rgba(232, 232, 232, 0.3);
}

.disabled-input {
  opacity: 0.6;
  cursor: not-allowed;
}

.template-textarea {
  font-family: 'Courier New', monospace;
  min-height: 150px;
  resize: vertical;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-actions {
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
  background: linear-gradient(135deg, #e8e8e8 0%, #c99e2c 100%);
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(232, 232, 232, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(100, 100, 100, 0.3);
  color: #ccc;
  border: 1px solid #666;
}

.btn-secondary:hover {
  background: rgba(100, 100, 100, 0.5);
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.preview-card h3 {
  color: #e8e8e8;
  margin: 0;
  font-size: 16px;
}

.test-variables {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(10, 10, 10, 0.5);
  border-radius: 6px;
}

.test-variables h4 {
  color: #e8e8e8;
  font-size: 12px;
  margin: 0 0 8px 0;
}

.test-input {
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(232, 232, 232, 0.2);
  color: #ccc;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
}

.test-input:focus {
  outline: none;
  border-color: #e8e8e8;
}

.preview-output {
  padding: 15px;
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(232, 232, 232, 0.3);
  border-radius: 6px;
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
}

.output-box {
  white-space: pre-wrap;
  word-break: break-word;
  color: #e8e8e8;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.placeholder-output {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.template-info {
  padding: 12px;
  background: rgba(232, 232, 232, 0.08);
  border-left: 3px solid #e8e8e8;
  border-radius: 4px;
  font-size: 12px;
}

.template-info p {
  margin: 4px 0;
}

.template-info strong {
  color: #e8e8e8;
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

@media (max-width: 1200px) {
  .editor-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .tabs-container {
    flex-direction: column;
  }

  .tab-button {
    width: 100%;
  }

  .editor-left,
  .editor-right {
    padding: 15px;
  }

  .template-textarea {
    min-height: 100px;
  }
}
</style>

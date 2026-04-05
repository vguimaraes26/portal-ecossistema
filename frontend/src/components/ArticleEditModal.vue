<template>
  <div v-if="modelValue" class="edit-modal-overlay" @click="closeModal">
    <div class="edit-modal-content" @click.stop>
      <!-- CLOSE BUTTON -->
      <button class="close-btn" @click="closeModal">✕</button>

      <!-- HEADER -->
      <div class="modal-header">
        <h2>✏️ Editar Artigo</h2>
        <p class="modal-subtitle">ID: #{{ article?.id }}</p>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <!-- SUCCESS MESSAGE -->
      <div v-if="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>

      <!-- FORM -->
      <form @submit.prevent="submitEdit" class="edit-form">
        <!-- HEADLINE -->
        <div class="form-group">
          <label for="headline">Título</label>
          <input
            id="headline"
            v-model="editedData.headline"
            type="text"
            placeholder="Título do artigo"
            required
          />
        </div>

        <!-- BODY -->
        <div class="form-group">
          <label for="body">Conteúdo</label>
          <textarea
            id="body"
            v-model="editedData.body"
            placeholder="Corpo do artigo (até 2000 caracteres)"
            maxlength="2000"
            rows="6"
          />
          <span class="char-count">{{ editedData.body?.length || 0 }} / 2000</span>
        </div>

        <!-- SEGMENT -->
        <div class="form-group">
          <label for="segment">Segmento</label>
          <select id="segment" v-model="editedData.segment" required>
            <option value="">Selecione um segmento</option>
            <option value="investimento">💰 Investimento</option>
            <option value="contabilidade">📊 Contabilidade</option>
            <option value="gestao">📈 Gestão</option>
            <option value="reforma_tributaria">⚖️ Reforma Tributária</option>
            <option value="ia_otimizacao">🤖 IA & Otimização</option>
          </select>
        </div>

        <!-- IMAGE -->
        <div class="form-group">
          <label for="image">URL da Imagem</label>
          <input
            id="image"
            v-model="editedData.image"
            type="url"
            placeholder="https://..."
          />
          <div v-if="editedData.image" class="image-preview">
            <img :src="editedData.image" :alt="editedData.headline" @error="imageError = true" />
            <span v-if="imageError" class="error-text">Erro ao carregar imagem</span>
          </div>
        </div>

        <!-- METADATA -->
        <div class="form-group">
          <label for="tone">Tom</label>
          <select id="tone" v-model="editedData.metadata.tone">
            <option value="profissional">👔 Profissional</option>
            <option value="casual">😊 Casual</option>
            <option value="executivo">🎯 Executivo</option>
            <option value="tecnico">🔧 Técnico</option>
          </select>
        </div>

        <!-- BUTTONS -->
        <div class="form-actions">
          <button
            type="submit"
            :disabled="isSaving"
            class="btn btn-primary"
          >
            {{ isSaving ? '⏳ Salvando...' : '💾 Salvar' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="btn btn-secondary"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>

      <!-- CHANGE SUMMARY -->
      <div v-if="hasMadeChanges" class="change-summary">
        <p><strong>Mudanças detectadas:</strong></p>
        <ul>
          <li v-if="editedData.headline !== article.headline">📝 Título modificado</li>
          <li v-if="editedData.body !== article.body">📄 Conteúdo modificado</li>
          <li v-if="editedData.segment !== article.segment">🏷️ Segmento modificado</li>
          <li v-if="editedData.image !== article.image">🖼️ Imagem modificada</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  article: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const editedData = ref({
  headline: '',
  body: '',
  segment: '',
  image: '',
  metadata: {
    tone: 'profissional'
  }
})

const isSaving = ref(false)
const error = ref(null)
const successMessage = ref(null)
const imageError = ref(false)

// Inicializa dados quando artigo muda
watch(
  () => props.article,
  (newArticle) => {
    if (newArticle) {
      editedData.value = {
        headline: newArticle.headline || newArticle.content?.headline || '',
        body: newArticle.body || newArticle.content?.body || '',
        segment: newArticle.segment || '',
        image: newArticle.image || '',
        metadata: {
          tone: newArticle.metadata?.tone || 'profissional'
        }
      }
    }
  },
  { immediate: true, deep: true }
)

const hasMadeChanges = computed(() => {
  if (!props.article) return false
  return (
    editedData.value.headline !== (props.article.headline || props.article.content?.headline) ||
    editedData.value.body !== (props.article.body || props.article.content?.body) ||
    editedData.value.segment !== props.article.segment ||
    editedData.value.image !== props.article.image
  )
})

const submitEdit = async () => {
  if (!hasMadeChanges.value) {
    error.value = 'Nenhuma mudança detectada'
    return
  }

  isSaving.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await axios.patch(
      `/api/articles/${props.article.id}`,
      editedData.value
    )

    successMessage.value = 'Artigo salvo com sucesso!'
    setTimeout(() => {
      emit('save', response.data.data)
      closeModal()
    }, 1000)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro ao salvar artigo'
    console.error('[ArticleEditModal] Erro:', err)
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => emit('update:modelValue', false)
</script>

<style scoped>
.edit-modal-overlay {
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

.edit-modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
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

.modal-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 15px;
}

.modal-header h2 {
  color: #e8e8e8;
  margin: 0 0 5px 0;
}

.modal-subtitle {
  color: #999;
  margin: 0;
  font-size: 12px;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border-left: 3px solid #ff4444;
  color: #ffaaaa;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.success-message {
  background: rgba(0, 255, 0, 0.1);
  border-left: 3px solid #44ff44;
  color: #88ff88;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: #e8e8e8;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #e8e8e8;
  color: #fff;
  padding: 10px;
  border-radius: 6px;
  font-family: inherit;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #666;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  font-size: 12px;
  color: #999;
}

.image-preview {
  margin-top: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
}

.error-text {
  color: #ff6666;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
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

.change-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #444;
  color: #999;
  font-size: 12px;
}

.change-summary p {
  color: #e8e8e8;
  margin: 0 0 8px 0;
}

.change-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.change-summary li {
  padding: 4px 0;
}

@media (max-width: 768px) {
  .edit-modal-content {
    max-width: 100%;
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

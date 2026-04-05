<template>
  <div v-if="modelValue" class="history-overlay" @click="closePanel">
    <div class="history-panel" @click.stop>
      <!-- CLOSE BUTTON -->
      <button class="close-btn" @click="closePanel">✕</button>

      <!-- HEADER -->
      <div class="history-header">
        <h2>📜 Histórico de Versões</h2>
        <p class="history-subtitle">Artigo #{{ articleId }}</p>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">
        <p>⏳ Carregando histórico...</p>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <!-- NO VERSIONS -->
      <div v-if="!loading && versions.length === 0" class="empty-state">
        <p>📭 Nenhuma versão encontrada para este artigo</p>
      </div>

      <!-- VERSIONS LIST -->
      <div v-if="!loading && versions.length > 0" class="versions-list">
        <div
          v-for="(version, index) in versions"
          :key="version.versionId"
          class="version-item"
          :class="{ selected: selectedVersion?.versionId === version.versionId }"
          @click="selectVersion(version)"
        >
          <!-- VERSION HEADER -->
          <div class="version-header">
            <span class="version-badge">
              v{{ version.versionNumber }}
            </span>
            <span class="version-type" :class="`type-${version.changeType}`">
              {{ getChangeTypeLabel(version.changeType) }}
            </span>
            <span class="version-time">
              {{ formatDate(version.timestamp) }}
            </span>
          </div>

          <!-- CHANGES SUMMARY -->
          <div v-if="Object.keys(version.changes).length > 0" class="changes-summary">
            <p v-for="field in Object.keys(version.changes)" :key="field" class="change-item">
              📝 {{ field }}: <span class="changed">modificado</span>
            </p>
          </div>

          <!-- VERSION DETAILS (EXPANDED) -->
          <div v-if="selectedVersion?.versionId === version.versionId" class="version-details">
            <div class="detail-item">
              <strong>Autor:</strong> {{ version.user }}
            </div>
            <div class="detail-item">
              <strong>Data/Hora:</strong> {{ formatDateTime(version.timestamp) }}
            </div>

            <!-- CHANGES DETAIL -->
            <div v-if="Object.keys(version.changes).length > 0" class="changes-detail">
              <h4>Alterações:</h4>
              <div v-for="(change, field) in version.changes" :key="field" class="change-detail">
                <div class="change-field">📌 {{ field }}</div>
                <div class="change-values">
                  <div class="before">
                    <strong>Antes:</strong>
                    <div class="value-box before-value">
                      {{ truncateText(change.before, 100) || '(vazio)' }}
                    </div>
                  </div>
                  <div class="after">
                    <strong>Depois:</strong>
                    <div class="value-box after-value">
                      {{ truncateText(change.after, 100) || '(vazio)' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- VERSION ACTIONS -->
            <div class="version-actions">
              <button
                v-if="index > 0"
                class="btn btn-rollback"
                @click="confirmRollback(version)"
              >
                ⬅️ Restaurar esta versão
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ROLLBACK CONFIRMATION -->
      <div v-if="rollbackConfirm" class="rollback-confirm">
        <div class="confirm-content">
          <h3>⚠️ Confirmar Rollback</h3>
          <p>Tem certeza que deseja restaurar a versão {{ rollbackConfirm.versionNumber }}?</p>
          <p class="confirm-date">Data: {{ formatDateTime(rollbackConfirm.timestamp) }}</p>
          <div class="confirm-buttons">
            <button class="btn btn-confirm" @click="executeRollback">
              {{ isRollbacking ? '⏳ Restaurando...' : '✅ Confirmar' }}
            </button>
            <button class="btn btn-cancel" @click="rollbackConfirm = null">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  articleId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'rollback-done'])

const versions = ref([])
const selectedVersion = ref(null)
const loading = ref(false)
const error = ref(null)
const rollbackConfirm = ref(null)
const isRollbacking = ref(false)

onMounted(() => {
  loadVersions()
})

const loadVersions = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`/api/articles/${props.articleId}/versions`)
    versions.value = response.data.versions || []

    if (versions.value.length > 0) {
      selectedVersion.value = versions.value[0]
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro ao carregar histórico'
    console.error('[VersionHistoryPanel] Erro:', err)
  } finally {
    loading.value = false
  }
}

const selectVersion = (version) => {
  if (selectedVersion.value?.versionId === version.versionId) {
    selectedVersion.value = null
  } else {
    selectedVersion.value = version
  }
}

const confirmRollback = (version) => {
  rollbackConfirm.value = version
}

const executeRollback = async () => {
  if (!rollbackConfirm.value) return

  isRollbacking.value = true
  error.value = null

  try {
    const response = await axios.post(
      `/api/articles/${props.articleId}/rollback/${rollbackConfirm.value.versionId}`
    )

    emit('rollback-done', response.data.data)
    rollbackConfirm.value = null
    closePanel()
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Erro ao restaurar versão'
    console.error('[VersionHistoryPanel] Erro no rollback:', err)
  } finally {
    isRollbacking.value = false
  }
}

const getChangeTypeLabel = (changeType) => {
  const labels = {
    'create': '✨ Criado',
    'edit': '✏️ Editado',
    'publish': '📤 Publicado',
    'rollback': '⬅️ Restaurado'
  }
  return labels[changeType] || changeType
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const closePanel = () => emit('update:modelValue', false)
</script>

<style scoped>
.history-overlay {
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

.history-panel {
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
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

.history-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 15px;
}

.history-header h2 {
  color: #e8e8e8;
  margin: 0 0 5px 0;
}

.history-subtitle {
  color: #999;
  margin: 0;
  font-size: 12px;
}

.loading-state,
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border-left: 3px solid #ff4444;
  color: #ffaaaa;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.versions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.version-item:hover {
  border-color: #e8e8e8;
  background: rgba(232, 232, 232, 0.05);
}

.version-item.selected {
  border-color: #e8e8e8;
  background: rgba(232, 232, 232, 0.1);
}

.version-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.version-badge {
  background: #e8e8e8;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 12px;
}

.version-type {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
}

.type-create { color: #88ff88; }
.type-edit { color: #ffdd88; }
.type-publish { color: #88ddff; }
.type-rollback { color: #ff88dd; }

.version-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.changes-summary {
  margin: 10px 0 0 0;
  padding: 8px 0;
  border-top: 1px solid #444;
}

.change-item {
  color: #aaa;
  font-size: 12px;
  margin: 4px 0;
}

.changed {
  color: #ffdd88;
}

.version-details {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #444;
}

.detail-item {
  color: #bbb;
  font-size: 13px;
  margin-bottom: 8px;
}

.detail-item strong {
  color: #e8e8e8;
}

.changes-detail {
  margin-top: 12px;
}

.changes-detail h4 {
  color: #e8e8e8;
  margin: 0 0 10px 0;
  font-size: 13px;
}

.change-detail {
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
}

.change-field {
  color: #ffdd88;
  font-size: 12px;
  margin-bottom: 8px;
}

.change-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.before,
.after {
  font-size: 12px;
}

.before strong { color: #ff8888; }
.after strong { color: #88ff88; }

.value-box {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 3px;
  margin-top: 4px;
  max-height: 60px;
  overflow: hidden;
  word-break: break-word;
}

.before-value { border-left: 2px solid #ff8888; }
.after-value { border-left: 2px solid #88ff88; }

.version-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-rollback {
  background: #e8e8e8;
  color: #000;
  flex: 1;
}

.btn-rollback:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(232, 232, 232, 0.3);
}

.rollback-confirm {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #ff6666;
  border-radius: 8px;
  padding: 30px;
  z-index: 1001;
  min-width: 300px;
}

.confirm-content h3 {
  color: #ff6666;
  margin: 0 0 15px 0;
}

.confirm-content p {
  color: #bbb;
  margin: 8px 0;
}

.confirm-date {
  color: #999;
  font-size: 12px;
}

.confirm-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-confirm {
  background: #88ff88;
  color: #000;
  flex: 1;
}

.btn-cancel {
  background: rgba(100, 100, 100, 0.3);
  color: #ccc;
  flex: 1;
  border: 1px solid #666;
}

@media (max-width: 768px) {
  .history-panel {
    max-width: 100%;
    padding: 20px;
  }

  .change-values {
    grid-template-columns: 1fr;
  }
}
</style>

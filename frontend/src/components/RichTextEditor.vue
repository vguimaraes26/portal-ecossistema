<template>
  <div class="rich-editor-container">
    <!-- TOOLBAR -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button
          title="Negrito"
          :class="{ active: isBold }"
          @click="toggleBold"
          class="toolbar-btn"
        >
          <strong>B</strong>
        </button>
        <button
          title="Itálico"
          :class="{ active: isItalic }"
          @click="toggleItalic"
          class="toolbar-btn"
        >
          <em>I</em>
        </button>
        <button title="Link" @click="insertLink" class="toolbar-btn">
          🔗
        </button>
      </div>

      <div class="toolbar-group">
        <button title="Heading 1" @click="insertHeading(1)" class="toolbar-btn">
          H1
        </button>
        <button title="Heading 2" @click="insertHeading(2)" class="toolbar-btn">
          H2
        </button>
        <button title="Heading 3" @click="insertHeading(3)" class="toolbar-btn">
          H3
        </button>
      </div>

      <div class="toolbar-group">
        <button title="Quote" @click="insertBlockquote" class="toolbar-btn">
          "
        </button>
        <button title="Lista" @click="insertList" class="toolbar-btn">
          •
        </button>
      </div>

      <div class="toolbar-spacer"></div>

      <div class="toolbar-group">
        <button
          title="Desfazer"
          @click="undo"
          class="toolbar-btn"
          :disabled="!canUndo"
        >
          ↶
        </button>
        <button
          title="Refazer"
          @click="redo"
          class="toolbar-btn"
          :disabled="!canRedo"
        >
          ↷
        </button>
      </div>

      <div class="toolbar-group">
        <button
          :class="['toolbar-btn', { active: showPreview }]"
          @click="showPreview = !showPreview"
          title="Preview"
        >
          👁️
        </button>
      </div>
    </div>

    <!-- EDITOR SECTION -->
    <div class="editor-section">
      <!-- LEFT: EDITOR -->
      <div class="editor-left">
        <textarea
          ref="editorRef"
          v-model="content"
          placeholder="Digite seu conteúdo aqui (suporta markdown simples)..."
          class="editor-textarea"
          @keydown="handleKeydown"
          @input="updatePreview"
        />

        <!-- CHARACTER COUNT -->
        <div class="editor-footer">
          <span class="char-count">{{ content.length }} caracteres</span>
          <span class="word-count">{{ wordCount }} palavras</span>
        </div>
      </div>

      <!-- RIGHT: PREVIEW -->
      <div v-if="showPreview" class="editor-right">
        <div class="preview-header">
          <h3>👁️ Preview</h3>
          <select v-model="selectedTone" class="tone-select">
            <option value="profissional">👔 Profissional</option>
            <option value="casual">😊 Casual</option>
            <option value="executivo">🎯 Executivo</option>
            <option value="tecnico">🔧 Técnico</option>
          </select>
        </div>

        <div class="preview-content" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  tone: {
    type: String,
    default: 'profissional'
  }
})

const emit = defineEmits(['update:modelValue', 'update:tone'])

const editorRef = ref(null)
const content = ref(props.modelValue)
const selectedTone = ref(props.tone)
const showPreview = ref(false)
const history = ref([content.value])
const historyIndex = ref(0)

const wordCount = computed(() => {
  return content.value.trim().split(/\s+/).filter(w => w.length > 0).length
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

const isBold = computed(() => {
  return isMarkupActive('**')
})

const isItalic = computed(() => {
  return isMarkupActive('*')
})

const renderedContent = computed(() => {
  return renderMarkdown(content.value, selectedTone.value)
})

watch(() => props.modelValue, (newVal) => {
  content.value = newVal
})

watch(() => props.tone, (newVal) => {
  selectedTone.value = newVal
})

watch(content, (newVal) => {
  emit('update:modelValue', newVal)
  addToHistory(newVal)
})

watch(selectedTone, (newVal) => {
  emit('update:tone', newVal)
})

const isMarkupActive = (markup) => {
  if (!editorRef.value) return false

  const textarea = editorRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd

  if (start === end) return false

  const selected = content.value.substring(start, end)
  return selected.startsWith(markup) && selected.endsWith(markup)
}

const toggleBold = () => {
  insertMarkup('**', '**')
}

const toggleItalic = () => {
  insertMarkup('*', '*')
}

const insertMarkup = (before, after) => {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.value.substring(start, end) || 'texto'

  const newContent =
    content.value.substring(0, start) +
    before +
    selected +
    after +
    content.value.substring(end)

  content.value = newContent

  setTimeout(() => {
    textarea.selectionStart = start + before.length
    textarea.selectionEnd = start + before.length + selected.length
    textarea.focus()
  }, 0)
}

const insertLink = () => {
  const url = prompt('Digite a URL:', 'https://')
  if (!url) return

  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = content.value.substring(start, end) || 'link'

  const newContent =
    content.value.substring(0, start) +
    `[${text}](${url})` +
    content.value.substring(end)

  content.value = newContent
  textarea.focus()
}

const insertHeading = (level) => {
  insertAtLineStart('#'.repeat(level) + ' ')
}

const insertBlockquote = () => {
  insertAtLineStart('> ')
}

const insertList = () => {
  insertAtLineStart('• ')
}

const insertAtLineStart = (prefix) => {
  const textarea = editorRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const lineStart = content.value.lastIndexOf('\n', start - 1) + 1
  const before = content.value.substring(0, lineStart)
  const line = content.value.substring(lineStart, start)
  const after = content.value.substring(start)

  content.value = before + prefix + line + after

  setTimeout(() => {
    textarea.selectionStart = start + prefix.length
    textarea.selectionEnd = start + prefix.length
    textarea.focus()
  }, 0)
}

const handleKeydown = (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault()
      undo()
    } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
      e.preventDefault()
      redo()
    } else if (e.key === 'b') {
      e.preventDefault()
      toggleBold()
    } else if (e.key === 'i') {
      e.preventDefault()
      toggleItalic()
    }
  }
}

const addToHistory = (value) => {
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(value)
  historyIndex.value = history.value.length - 1
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    content.value = history.value[historyIndex.value]
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    content.value = history.value[historyIndex.value]
  }
}

const updatePreview = () => {
  // Trigger computed property update
}

const renderMarkdown = (text, tone) => {
  let html = text

  // Escapa HTML
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Headings
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')

  // Blockquote
  html = html.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>')

  // List items
  html = html.replace(/^• (.*?)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>')

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  // Aplica tom
  const toneClass = `tone-${tone}`

  return `<div class="rendered-content ${toneClass}">${html}</div>`
}
</script>

<style scoped>
.rich-editor-container {
  display: flex;
  flex-direction: column;
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid rgba(232, 232, 232, 0.2);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(10, 10, 10, 0.9);
  border-bottom: 1px solid rgba(232, 232, 232, 0.2);
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 4px;
  padding: 0 8px;
  border-right: 1px solid rgba(232, 232, 232, 0.2);
}

.toolbar-group:last-of-type {
  border-right: none;
}

.toolbar-btn {
  background: rgba(232, 232, 232, 0.1);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 12px;
}

.toolbar-btn:hover:not(:disabled) {
  background: rgba(232, 232, 232, 0.2);
  border-color: rgba(232, 232, 232, 0.6);
}

.toolbar-btn.active {
  background: rgba(232, 232, 232, 0.3);
  border-color: #e8e8e8;
  box-shadow: 0 0 8px rgba(232, 232, 232, 0.3);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-spacer {
  flex: 1;
}

.editor-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  min-height: 400px;
}

.editor-left,
.editor-right {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-textarea {
  flex: 1;
  background: rgba(10, 10, 10, 0.9);
  color: #ccc;
  border: none;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  resize: none;
  line-height: 1.6;
}

.editor-textarea:focus {
  outline: none;
}

.editor-footer {
  display: flex;
  gap: 20px;
  padding: 8px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(232, 232, 232, 0.1);
  font-size: 12px;
  color: #999;
}

.char-count,
.word-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.editor-right {
  background: rgba(10, 10, 10, 0.5);
  border-left: 1px solid rgba(232, 232, 232, 0.2);
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(232, 232, 232, 0.2);
}

.preview-header h3 {
  color: #e8e8e8;
  margin: 0;
  font-size: 14px;
}

.tone-select {
  background: rgba(232, 232, 232, 0.1);
  border: 1px solid rgba(232, 232, 232, 0.3);
  color: #e8e8e8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  line-height: 1.7;
}

.rendered-content {
  color: #bbb;
}

.rendered-content h1,
.rendered-content h2,
.rendered-content h3 {
  color: #e8e8e8;
  margin: 15px 0 10px 0;
}

.rendered-content h1 {
  font-size: 1.8rem;
}

.rendered-content h2 {
  font-size: 1.5rem;
}

.rendered-content h3 {
  font-size: 1.2rem;
}

.rendered-content strong {
  color: #fff;
}

.rendered-content em {
  color: #e8e8e8;
}

.rendered-content a {
  color: #88ddff;
  text-decoration: none;
  border-bottom: 1px dotted #88ddff;
}

.rendered-content a:hover {
  text-decoration: underline;
}

.rendered-content blockquote {
  border-left: 3px solid #e8e8e8;
  padding-left: 12px;
  margin: 10px 0;
  color: #999;
  font-style: italic;
}

.rendered-content ul {
  padding-left: 20px;
  margin: 10px 0;
}

.rendered-content li {
  margin: 5px 0;
}

.rendered-content br {
  display: block;
  height: 0;
}

.tone-profissional {
  --tone-accent: #e8e8e8;
}

.tone-casual {
  --tone-accent: #88ff88;
}

.tone-executivo {
  --tone-accent: #ffdd88;
}

.tone-tecnico {
  --tone-accent: #88ddff;
}

@media (max-width: 1024px) {
  .editor-section {
    grid-template-columns: 1fr;
    min-height: 600px;
  }

  .editor-right {
    border-left: none;
    border-top: 1px solid rgba(232, 232, 232, 0.2);
  }
}

@media (max-width: 768px) {
  .toolbar-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  .editor-textarea {
    font-size: 12px;
    padding: 10px;
  }

  .editor-section {
    min-height: 400px;
  }
}
</style>

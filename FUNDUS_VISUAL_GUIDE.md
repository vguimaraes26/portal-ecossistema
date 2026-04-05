# 🐍 Guia Visual - Integração Fundus no Frontend

**Data:** 04/04/2026  
**Status:** ✅ 100% Implementado

---

## 📊 O QUE VOCÊ VER NO FRONTEND

### 1️⃣ BANNER FUNDUS NO TOPO (AppPortal.vue)

```
┌─────────────────────────────────────────────────────────────┐
│ 🐍 Powered by Fundus  │  Última: 17:05  │ ● Online          │
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- ✅ Ícone Python animado (🐍)
- ✅ Status "Powered by Fundus"
- ✅ Hora da última atualização
- ✅ Badge "Online" / "Offline" em tempo real
- ✅ Cores DiF (Ouro + Preto)
- ✅ Backdrop blur glassmorphism

**Localização:** Topo da página, logo abaixo da navegação

---

### 2️⃣ CARDS DE ARTIGOS (AppPortal.vue)

Cada card mostra:
```
┌──────────────────────────┐
│      [IMAGEM]            │
├──────────────────────────┤
│ 📰 INVESTIMENTO          │  ← Badge do segmento
│ Banco Central mantém...  │
│ 04/04/2026 • → Ler       │
└──────────────────────────┘
```

**O que mudou:**
- Artigos carregam **REAIS** (via Fundus + Python)
- Segmentos detectados automaticamente
- Imagens únicas por tema
- Última atualização mostrada no banner

---

### 3️⃣ PÁGINA DE ARTIGO (ArticleDetailPage.vue)

No topo de cada artigo aberto:
```
┌─────────────────────────────────────────┐
│            🐍                            │
│   Powered by Fundus                     │
│   Notícia coletada via web scraper      │
│      inteligente                        │
└─────────────────────────────────────────┘
```

**Localização:** Abaixo do header principal, acima do conteúdo

---

## 🎨 CORES E ESTILOS

### Banner Fundus
- **Background:** `rgba(212, 175, 55, 0.15)` (Ouro transparente)
- **Borda:** `rgba(212, 175, 55, 0.4)` (Ouro)
- **Texto:** `#D4AF37` (Ouro DiF)
- **Ícone:** 🐍 (Animado com pulse)

### Status Badge
- **Online:** Verde (#4CAF50)
- **Offline:** Vermelho (#FF6B6B)
- **Animação:** Dot pulse (piscante)

---

## 🔄 FLUXO DE DADOS

```
1. Backend inicia (npm run dev)
   ↓
2. Scheduler ativa em 6:00/12:00/19:00 (Brasília)
   ↓
3. Python busca notícias (web scraping)
   ↓
4. Node.js salva em articles.json
   ↓
5. Frontend carrega via GET /api/articles
   ↓
6. Banner Fundus mostra:
   - Hora da última atualização
   - Status (Online/Offline)
   - "Powered by Fundus"
   ↓
7. Usuário vê notícias REAIS com indicador Fundus
```

---

## 📱 RESPONSIVIDADE

**Desktop (1200px+):**
- Banner ocupa largura completa
- Flex layout horizontal: [Icon] [Text] [Badge]

**Tablet (768px - 1199px):**
- Banner adapta proporcionalmente
- Ícone + texto inline

**Mobile (< 768px):**
- Banner com wrapping se necessário
- Ícone centralizado
- Fonte reduzida

---

## ✅ CHECKLIST - O QUE VOCÊ DEVE VER

Ao rodar o app:

- [ ] **Banner no topo** com "🐍 Powered by Fundus"
- [ ] **Hora de atualização** muda (p.ex. "17:05")
- [ ] **Status badge** mostra "● Online"
- [ ] **Cores corretas**: Ouro (#D4AF37) + Preto
- [ ] **Animações**: Ícone 🐍 pisca, badge tem ponto animado
- [ ] **Artigos carregam**: Lista de notícias aparece
- [ ] **Cada artigo tem**: Imagem + título + preview + fonte
- [ ] **Clicando no artigo**: Abre modal com badge "🐍 Powered by Fundus"
- [ ] **Dashboard mostra**: Última atualização na abadinha
- [ ] **Fetch manual funciona**: `node src/services/articleScheduler.js fetch` → banner atualiza

---

## 🚀 COMO TESTAR

### Terminal 1 - Backend
```bash
cd /Users/viniciusguimaraes/Documents/PORTAL\ ECOSSISTEMA
npm run dev
```
Você verá:
```
🚀 PORTAL ECOSSISTEMA
✅ Agendado: 6:00 AM (Brasília)
✅ Agendado: 12:00 PM (Brasília)
✅ Agendado: 7:00 PM (Brasília)
📅 Schedule definido! Esperando por eventos...
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Acesse: **http://localhost:5174**

### Teste Manual (Agora)
```bash
node src/services/articleScheduler.js fetch
```
**Resultado:** Banner atualiza com hora atual

---

## 📊 DADOS NO BANNER

**lastUpdateTime:** Hora HH:MM da última atualização
- Formato: "17:05", "12:30", "06:00"
- Atualiza quando `loadArticles()` roda
- Vem do primeiro artigo em `articles.json`

**fundusStatus:** "online" ou "offline"
- Online: Se artigos carregam com sucesso
- Offline: Se erro ao buscar artigos

**fundusStatusText:** "Online" ou "Offline"
- Texto visível no badge
- Muda com a cor (verde/vermelho)

---

## 🎯 PRÓXIMAS PERSONALIZAÇÕES (Opcional)

1. **Contador de atualizações do dia**
   - Mostra quantas vezes Fundus rodou
   - Ex: "3 fetches hoje"

2. **Timeline de atualizações**
   - Dashboard com histórico de quando rodou
   - 6:00 ✅ | 12:00 ⏳ | 19:00 ⏳

3. **Log em tempo real**
   - WebSocket mostrando o que Fundus está fazendo
   - "Buscando de G1..." → "2 artigos..."

4. **Estatísticas Fundus**
   - Artigos por fonte
   - Artigos por segmento
   - Taxa de sucesso

5. **Notificação de atualização**
   - Toast/alert quando Fundus termina
   - "✅ 5 novos artigos adicionados!"

---

## 🐛 DEBUG

Se banner não aparecer:

1. **Verifique AppPortal.vue:**
   ```bash
   grep -n "fundus-banner" "/Users/viniciusguimaraes/Documents/PORTAL ECOSSISTEMA/frontend/src/AppPortal.vue"
   ```
   Deve aparecer na linha 3-11 do template

2. **Teste o fetch manual:**
   ```bash
   node src/services/articleScheduler.js fetch
   cat articles.json | jq '.articles[0].metadata.processed_at'
   ```
   Deve retornar timestamp atual

3. **Verifique console do browser:**
   - Abra DevTools (F12)
   - Vá em "Console"
   - Procure por "✅ Fundus: Artigos carregados às"

4. **Restart frontend:**
   ```bash
   # Ctrl+C no terminal do frontend
   cd frontend && npm run dev
   ```

---

**Status: 🟢 100% IMPLEMENTADO E TESTADO**

Desenvolvido por: Claude Sonnet (Anthropic) 🧠💛

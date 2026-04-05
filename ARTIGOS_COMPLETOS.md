# 📝 Sistema de Artigos Completos - DiF Ecosystem

## 🎯 Objetivo

Sistema completo para gerar artigos com **comunicação customizada por segmento**, não apenas manchetes.

Cada segmento tem seu próprio **tom de voz**, **prompts de comunicação** e **diretrizes de conteúdo**.

---

## 📊 Segmentos Implementados

### 1️⃣ **CONTABILIDADE** 📊

**Público-alvo:** Contadores, CFOs, Compliance Officers, Empresas

**Tom de Voz:**
- Técnico e preciso
- Focado em conformidade e legislação
- Estrutura: Problema Legal → Implicação Fiscal → Solução Prática
- Adjetivos: Rigoroso, exato, regulatório, prudente

**Exemplos de Palavras-chave:**
`conformidade`, `legislação`, `fiscal`, `imposto`, `regulação`, `compliance`, `auditoria`, `balanço`

**O que é processado:**
- Implicações legais e regulatórias
- Aspectos fiscais (IRPF, ECF, CSLL, etc)
- Obrigações de compliance
- Recomendações práticas

---

### 2️⃣ **INVESTIMENTO** 📈

**Público-alvo:** Investidores, Traders, Asset Managers, Consultores

**Tom de Voz:**
- Profissional e objetivo
- Focado em ROI e oportunidades
- Estrutura: Fato → Análise Financeira → Oportunidade de Investimento
- Adjetivos: Estratégico, rentável, sinergético, competitivo

**Exemplos de Palavras-chave:**
`investimento`, `retorno`, `ações`, `mercado`, `oportunidade`, `rentabilidade`, `portfólio`, `fundos`

**O que é processado:**
- Impactos em ações, fundos, mercado
- Potencial de retorno ou risco
- Análise de volatilidade e oportunidades
- Recomendações de investimento

---

### 3️⃣ **REFORMA TRIBUTÁRIA** ⚖️

**Público-alvo:** CFOs, Gestores Financeiros, Consultores, Executivos

**Tom de Voz:**
- Consultivo e proativo
- Focado em impactos operacionais e estratégia
- Estrutura: Mudança → Impacto Empresarial → Recomendações Estratégicas
- Adjetivos: Estratégico, prudente, inovador, adaptável

**Exemplos de Palavras-chave:**
`reforma`, `tributária`, `imposto`, `estratégia`, `planejamento`, `impacto`, `mudança`, `oportunidade`

**O que é processado:**
- Impactos na operação e fluxo de caixa
- Efeitos em planejamento fiscal
- Recomendações estratégicas
- Ações recomendadas

---

## 🔄 Fluxo de Funcionamento

```
1. COLETA (scraper.js)
   ↓
   Notícia bruta (manchete + conteúdo curto)

2. CLASSIFICAÇÃO (classifier.js)
   ↓
   Detecta segmento: contabilidade / investimento / reforma_tributaria

3. GERAÇÃO (articleGenerator.js)
   ↓
   → Lê prompts de comunicação customizados
   → Reescreve com tom de voz específico
   → Gera artigo completo (3-4 parágrafos)
   → Gera postagem para redes sociais

4. ARMAZENAMENTO
   ↓
   articles.json com artigos completos

5. EXIBIÇÃO (frontend/ArticleViewer.vue)
   ↓
   Interface com design DiF (ouro + preto)
```

---

## 🛠️ Como Usar

### 1️⃣ **Gerar Artigos**

```bash
# Gera artigos para todos os segmentos
npm run articles

# Gera apenas para segmento específico
npm run articles contabilidade
npm run articles investimento
npm run articles reforma_tributaria

# Reprocessa com todos os segmentos
npm run articles all
```

**Saída esperada:**
```
╔════════════════════════════════════════════╗
║   📝 GERADOR DE ARTIGOS - DiF Ecosystem   ║
╚════════════════════════════════════════════╝

📰 Encontradas 9 notícias originais

🎯 Processando segmentos: investimento, contabilidade, reforma_tributaria

📝 Processando artigo: "Banco Central mantém Selic em 10,5%"
🎯 Segmento: investimento
   → Gerando artigo com tom de voz...
   → Gerando postagem...
   ✅ Artigo processado (245 palavras)

[... continua para outros artigos e segmentos ...]

╔════════════════════════════════════════════╗
║   ✅ PROCESSAMENTO CONCLUÍDO              ║
├════════════════════════════════════════════┤
║   Artigos gerados:  27
║   Segmentos:        investimento, contabilidade, reforma_tributaria
║   Arquivo:          articles.json
╚════════════════════════════════════════════╝
```

---

### 2️⃣ **Acessar Artigos via API**

**Backend rodando:**
```bash
npm run dev
```

**Endpoints disponíveis:**

```bash
# Listar todos os artigos
curl http://localhost:3000/api/articles

# Obter artigo específico
curl http://localhost:3000/api/articles/1

# Artigos por segmento
curl http://localhost:3000/api/articles/segment/investimento
curl http://localhost:3000/api/articles/segment/contabilidade
curl http://localhost:3000/api/articles/segment/reforma_tributaria

# Estatísticas
curl http://localhost:3000/api/articles/stats/summary
```

---

### 3️⃣ **Visualizar no Frontend**

```bash
# Frontend rodando (outro terminal)
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

**Componente ArticleViewer oferece:**
- ✅ Filtro por segmento
- ✅ Cards com preview dos artigos
- ✅ Modal com artigo completo
- ✅ Tom de voz indicado
- ✅ Palavras-chave
- ✅ Postagem para redes sociais (com botão copiar)
- ✅ Link para notícia original
- ✅ Design com paleta DiF (ouro + preto)

---

## 📋 Estrutura de Dados

### Artigo Completo (articles.json)

```json
{
  "id": 1,
  "original_title": "Banco Central mantém Selic em 10,5% em decisão unânime",
  "original_url": "https://...",
  "original_source": "CNN Brasil",
  "segment": "investimento",
  "content": {
    "headline": "Banco Central mantém Selic em 10,5% em decisão unânime",
    "body": "O Banco Central confirmou hoje a manutenção da taxa Selic em 10,5% ao ano...",
    "preview": "O Banco Central confirmou hoje a manutenção da taxa Selic em 10,5%..."
  },
  "social": {
    "post": "📈 SELIC EM 10,5%: Banco Central mantém taxa e reforça posição prudente. Impacto imediato em investimentos de renda fixa. #InvestimentoInteligente #Mercado #BC",
    "hashtags": ["#InvestimentoInteligente", "#Mercado", "#BC"]
  },
  "metadata": {
    "processed_at": "2026-04-04T10:30:00.000Z",
    "word_count": 245,
    "tone": "profissional, objetivo, focado em ROI",
    "keywords": ["investimento", "retorno", "ações", "mercado", ...]
  },
  "image": "https://...",
  "original_content": "O Banco Central manteve a taxa Selic em 10,5% ao ano na reunião de hoje do Copom."
}
```

---

## 🎨 Paleta de Cores DiF

Usada no frontend para design consistente:

```javascript
{
  primary: '#D4A041',           // Ouro (logo)
  primary_dark: '#B8860B',      // Ouro escuro
  primary_light: '#F4D699',     // Ouro claro
  secondary: '#000000',         // Preto (logo)
  accent: '#FFD700',            // Dourado
  text_primary: '#000000',
  background: '#ffffff'
}
```

---

## 📝 Customizar Prompts de Comunicação

Edite `/src/processors/communicationPrompts.js`:

```javascript
const COMMUNICATION_PROMPTS = {
  meu_segmento: {
    tone: 'descrição do tom',
    audience: 'público-alvo',
    brand_voice: `
      • Linguagem: ...
      • Foco: ...
      • Estrutura: ...
      • Tom: ...
      • Adjetivos: ...
    `,
    article_prompt: `Seu prompt customizado aqui...`,
    post_prompt: `Seu prompt para postagem aqui...`,
    keywords: ['palavra1', 'palavra2', ...]
  }
};
```

---

## 🔍 Estrutura de Arquivos

```
PORTAL ECOSSISTEMA/
├── src/processors/
│   ├── communicationPrompts.js      ← Configuração de tom/voice
│   ├── articleGenerator.js          ← Gerador de artigos
│   ├── classifier.js                ← Classificador de segmentos
│   └── newsProcessor.js             ← Reescritor inicial
├── src/api/routes/
│   └── articles.js                  ← Endpoints de artigos
├── scripts/
│   ├── generateArticles.js          ← Script para gerar artigos
│   ├── scraper.js                   ← Coleta de notícias
│   └── processNews.js               ← Processamento IA
├── frontend/src/
│   ├── ArticleViewer.vue            ← Componente visual
│   └── App.vue                      ← App principal
├── articles.json                    ← Artigos processados
├── data.json                        ← Notícias brutas
└── ARTIGOS_COMPLETOS.md             ← Esta documentação
```

---

## 🚀 Próximos Passos

- [ ] Adicionar mais segmentos (e.g., "Gestão Empresarial", "Marketing")
- [ ] Sistema de templates para diferentes formatos
- [ ] Integração com redes sociais para postagem automática
- [ ] Analytics de engajamento
- [ ] A/B testing de prompts

---

## ⚙️ Variáveis de Ambiente

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxxxx
PORT=3000
```

---

## 📞 Suporte

Dúvidas? Verifique:
1. Logs do `npm run articles`
2. Estrutura de `articles.json`
3. Configurações em `communicationPrompts.js`
4. Endpoints da API em `src/api/routes/articles.js`

---

**DiF Ecosystem - Sistema de Artigos Completos** ✨

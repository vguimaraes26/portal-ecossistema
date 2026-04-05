# Guia de Implementação

## Setup Inicial

```bash
cd "/Users/viniciusguimaraes/Documents/PORTAL ECOSSISTEMA"
npm install
cp .env.example .env
# Editar .env com sua ANTHROPIC_API_KEY
```

## Estrutura de Pastas Detalhada

```
src/
├── db/
│   ├── schema.sql          # Definição do banco
│   ├── init.js             # Inicializa SQLite
│   └── models.js           # Queries principais
│
├── scrapers/
│   ├── cnn.js              # Scraper CNN
│   ├── infomoney.js        # Scraper Infomoney
│   ├── portalDoContador.js # Scraper Portal do Contador
│   └── utils.js            # Helpers (delay, timeout, etc)
│
├── processors/
│   ├── prompts.js          # Templates de prompts por segmento
│   ├── newsProcessor.js    # Reescrita com Claude
│   ├── classifier.js       # Classifica em segmentos
│   └── validator.js        # Valida dados
│
├── generators/
│   ├── imageGenerator.js   # Busca/gera imagens
│   ├── imagePrompt.js      # Cria prompts para imagem
│   └── unsplash.js         # Integração Unsplash
│
├── api/
│   ├── routes/
│   │   ├── news.js         # GET /api/news
│   │   ├── segments.js     # GET /api/segments
│   │   └── admin.js        # POST /api/admin/*
│   └── middleware.js       # Auth, logging, etc
│
└── services/
    ├── scheduler.js        # Cron jobs automáticos
    └── cache.js            # Cache de resultados
```

## Principais Funções

### 1. Inicializar BD

```javascript
// src/db/init.js
const Database = require('better-sqlite3');

function initDB() {
  const db = new Database('./news.db');
  db.exec(fs.readFileSync('./src/db/schema.sql', 'utf8'));
  return db;
}
```

### 2. Scraper Base

```javascript
// src/scrapers/utils.js
async function scrapeWithRetry(url, selector, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      return $(selector);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(2000 * (i + 1)); // backoff exponencial
    }
  }
}
```

### 3. Detecção de Segmento (IA)

```javascript
// src/processors/classifier.js
async function classifyNews(title, content) {
  const prompt = `Classifique esta notícia em um segmento:
  - Investimento: mercado, ações, fundos, economia
  - Contabilidade: IRPF, balanço, conformidade
  - Estratégia: tendências, oportunidades
  
  Título: ${title}
  Conteúdo: ${content}
  
  Responda apenas: investimento|contabilidade|estrategia`;
  
  // Usar Claude API
}
```

### 4. Reescrita com Prompt Adaptado

```javascript
// src/processors/newsProcessor.js
async function rewriteNews(news, segment) {
  const { prompt } = SEGMENT_PROMPTS[segment];
  const finalPrompt = prompt.replace('{content}', news.content);
  
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: finalPrompt }]
  });
  
  return message.content[0].text;
}
```

## Fluxo Completo

```bash
# 1. Scraping
npm run scrape
# → Coleta de CNN, Infomoney, Portal do Contador
# → Salva em raw_news table

# 2. Processamento
npm run process
# → Valida dados
# → Classifica segmentos (IA)
# → Reescreve (IA + prompts)
# → Gera imagens
# → Salva em processed_news

# 3. Iniciar servidor
npm run dev
# → API Rest em http://localhost:3000
# → Dashboard em http://localhost:3000/admin
```

## Automation (Cron)

```javascript
// src/services/scheduler.js
const cron = require('node-cron');

// A cada 30 minutos: scraping
cron.schedule('*/30 * * * *', runScrapers);

// A cada hora: processamento
cron.schedule('0 * * * *', processNewNews);

// Diariamente 6am: limpeza
cron.schedule('0 6 * * *', cleanupOldNews);
```

## Secrets & Config

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxxx
DATABASE_URL=./news.db
PORT=3000
NODE_ENV=development
UNSPLASH_API_KEY=xxx (opcional)
```

## Testes

```bash
npm test
# Testa: scrapers, processors, API endpoints
```

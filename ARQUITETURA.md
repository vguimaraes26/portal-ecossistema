# Arquitetura - Portal Ecossistema DIF

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     PORTAL ECOSSISTEMA                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SCRAPERS          PROCESSAMENTO         PUBLICAÇÃO          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │ CNN         │───│ Reescrita IA │───│ API REST     │     │
│  ├─────────────┤   ├──────────────┤   ├──────────────┤     │
│  │ Infomoney   │───│ Classificação│───│ Dashboard    │     │
│  ├─────────────┤   ├──────────────┤   ├──────────────┤     │
│  │ Portal do   │───│ Geração de   │───│ Frontend     │     │
│  │ Contador    │   │ Imagem       │   │              │     │
│  └─────────────┘   └──────────────┘   └──────────────┘     │
│        │                  │                   │              │
│        └──────────────────┴───────────────────┘              │
│                         │                                    │
│                    ┌─────────────┐                          │
│                    │  SQLite DB  │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Pipeline de Processamento

1. **SCRAPING** (30min) - Coletar notícias das fontes
2. **TRATAMENTO** (5min) - Limpar e validar dados
3. **IA/REESCRITA** (10min) - Claude API reescreve com tom adaptado
4. **IMAGEM** (5min) - Gera descrição + busca/gera imagem
5. **PUBLICAÇÃO** (manual ou automática)

## Banco de Dados

### Tabelas Principais

```sql
-- Notícias originais
news_raw
- id, title, url, content, source, collected_at

-- Notícias processadas
news_processed
- id, original_id, title_rewrit, content_rewritten, segment, tone, image_url, status, published_at

-- Configurações por segmento
segments
- id, name, description, prompt_template, color

-- Log de processamento
processing_log
- id, news_id, step, status, error, processed_at
```

## Segmentos

| Segmento | Tom | Palavras-chave | Cores |
|----------|-----|---|---|
| **Investimento** | Profissional, objetivo, ROI | lucro, mercado, ações, fundos | Azul |
| **Contabilidade** | Técnico, regulatório | IRPF, balanço, conformidade, auditoria | Verde |
| **Estratégia** | Consultivo, executivo | mercado, tendências, oportunidades | Roxo |

## Fluxo de Dados

```
SOURCE NEWS
    ↓
[SCRAPER] → raw_news table
    ↓
[VALIDATOR] → Remove duplicatas, valida schema
    ↓
[SEGMENTIZER] → Classifica por segmento (IA)
    ↓
[REWRITER] → Reescreve com prompt + Claude
    ↓
[IMAGE_GEN] → Gera prompt para imagem
    ↓
[PUBLISHER] → Prepara para frontend
    ↓
PUBLIC WEBSITE
```

## URLs das Fontes

- **CNN Brasil**: https://www.cnnbrasil.com.br/
- **Infomoney**: https://www.infomoney.com.br/
- **Portal do Contador**: https://www.portalconsultoria.com.br/

## Variáveis de Ambiente

```
ANTHROPIC_API_KEY=xxx
DATABASE_URL=./news.db
PORT=3000
SCRAPE_INTERVAL=30  # minutos
ENVIRONMENT=development
```

## Performance

- **Scraping**: ~2 segundos por fonte
- **Reescrita IA**: ~3-5 segundos por notícia
- **Imagem**: ~1 segundo (busca Unsplash)
- **Total**: ~15-20min para 10 notícias/fonte

---

*Documentação do Portal Ecossistema DIF v1.0*

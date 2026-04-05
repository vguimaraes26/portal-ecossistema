/**
 * COMMUNICATION PROMPTS - Tone & Voice Configuration
 *
 * Sistema de comunicação customizado por segmento
 * Cada segmento tem seu próprio prompt, tom e diretrizes
 */

const COMMUNICATION_PROMPTS = {
  contabilidade: {
    tone: 'técnico, regulatório, conformidade',
    audience: 'Contadores, CFOs, Compliance Officers, Empresas',
    brand_voice: `
    • Linguagem: Técnica e precisa, com termos contábeis apropriados
    • Foco: Conformidade, legislação, impactos fiscais
    • Estrutura: Problema → Implicação Legal → Solução Prática
    • Tom: Confiável, seguro, orientado a conformidade
    • Adjetivos: Rigoroso, exato, regulatório, prudente
    `,
    article_prompt: `Você é um especialista em contabilidade e compliance escribindo para profissionais da área.

ARTIGO ORIGINAL:
"{content}"

INSTRUÇÕES:
1. Reescreva focando em implicações legais, fiscais e de conformidade
2. Destaque aspectos regulatórios e obrigações legais
3. Use linguagem técnica apropriada para contadores
4. Estruture em: Contexto Legal → Implicação Fiscal → Recomendações Práticas
5. Máximo 400 palavras, 3-4 parágrafos
6. Cite regulações específicas quando aplicável (IRPF, ECF, CSLL, etc)

Reescreva mantendo o tom profissional, preciso e orientado a conformidade:`,

    post_prompt: `Crie uma postagem para LinkedIn com máximo 150 caracteres que:
- Seja atraente e profissional
- Destaque a implicação legal/fiscal
- Use 2-3 hashtags relevantes para contabilidade
- Termine com uma chamada para ação (CTA)

Postagem:`,

    keywords: ['conformidade', 'legislação', 'fiscal', 'imposto', 'regulação', 'compliance', 'auditoria', 'balanço']
  },

  investimento: {
    tone: 'profissional, objetivo, focado em ROI',
    audience: 'Investidores, Traders, Asset Managers, Consultores de Investimento',
    brand_voice: `
    • Linguagem: Profissional, direta e data-driven
    • Foco: Oportunidades, retorno, impacto no portfólio
    • Estrutura: Fato → Análise → Oportunidade de Investimento
    • Tom: Confiante, analítico, orientado a resultados
    • Adjetivos: Estratégico, rentável, sinergético, competitivo
    `,
    article_prompt: `Você é um analista de investimentos escribindo para investidores profissionais.

ARTIGO ORIGINAL:
"{content}"

INSTRUÇÕES:
1. Reescreva focando em impactos financeiros e oportunidades de investimento
2. Analise impacto em ações, fundos, mercado
3. Use linguagem financeira apropriada (ROI, volatilidade, correlação, etc)
4. Estruture em: Cenário → Impacto Financeiro → Oportunidades de Investimento
5. Máximo 400 palavras, 3-4 parágrafos
6. Inclua potencial de retorno ou risco quando aplicável

Reescreva mantendo o tom profissional, objetivo e orientado a oportunidades:`,

    post_prompt: `Crie uma postagem para LinkedIn com máximo 150 caracteres que:
- Destaque a oportunidade financeira
- Use linguagem que atrai investidores
- Use 2-3 hashtags relacionadas a mercado/finanças
- Termine com uma chamada para ação (CTA)

Postagem:`,

    keywords: ['investimento', 'retorno', 'ações', 'mercado', 'oportunidade', 'rentabilidade', 'portfólio', 'fundos']
  },

  reforma_tributaria: {
    tone: 'informativo, consultivo, orientado a impacto',
    audience: 'CFOs, Gestores Financeiros, Consultores, Executivos, Contadores',
    brand_voice: `
    • Linguagem: Clara, consultiva e focada em impacto empresarial
    • Foco: Impactos operacionais, planejamento estratégico
    • Estrutura: Mudança → Impacto Empresarial → Ações Recomendadas
    • Tom: Consultivo, proativo, orientado a soluções
    • Adjetivos: Estratégico, prudente, inovador, adaptável
    `,
    article_prompt: `Você é um consultor de finanças e tributação escribindo para executivos.

ARTIGO ORIGINAL:
"{content}"

INSTRUÇÕES:
1. Reescreva focando em impactos e oportunidades da reforma tributária
2. Analise efeitos nas operações, fluxos de caixa e planejamento
3. Use linguagem estratégica e consultiva
4. Estruture em: Reforma → Impacto Empresarial → Recomendações Estratégicas
5. Máximo 400 palavras, 3-4 parágrafos
6. Inclua recomendações práticas de ação

Reescreva mantendo o tom consultivo, proativo e orientado ao impacto:`,

    post_prompt: `Crie uma postagem para LinkedIn com máximo 150 caracteres que:
- Destaque o impacto estratégico da reforma
- Use linguagem que atrai executivos/gestores
- Use 2-3 hashtags sobre tributação/estratégia
- Termine com CTA para discussão/planejamento

Postagem:`,

    keywords: ['reforma', 'tributária', 'imposto', 'estratégia', 'planejamento', 'impacto', 'mudança', 'oportunidade']
  }
};

/**
 * PALETA DE CORES - DiF ECOSYSTEM
 * Usado no frontend para design consistente
 */
const DIF_COLORS = {
  primary: '#D4A041',      // Ouro principal (da logo)
  primary_dark: '#B8860B', // Ouro escuro
  primary_light: '#F4D699', // Ouro claro
  secondary: '#000000',     // Preto (da logo)
  accent: '#FFD700',        // Dourado
  neutral_dark: '#1a1a1a',
  neutral_light: '#f5f5f5',
  text_primary: '#000000',
  text_secondary: '#666666',
  background: '#ffffff',
  border: '#e0e0e0'
};

/**
 * SEGMENT INFO - Informações completas por segmento
 */
const SEGMENT_INFO = {
  contabilidade: {
    name: 'Contabilidade',
    icon: '📊',
    color: DIF_COLORS.primary,
    description: 'Notícias de contabilidade, legislação e conformidade'
  },
  investimento: {
    name: 'Investimento',
    icon: '📈',
    color: DIF_COLORS.primary,
    description: 'Notícias de mercado, ações e oportunidades de investimento'
  },
  reforma_tributaria: {
    name: 'Reforma Tributária',
    icon: '⚖️',
    color: DIF_COLORS.primary,
    description: 'Notícias sobre reforma tributária e impactos estratégicos'
  }
};

module.exports = {
  COMMUNICATION_PROMPTS,
  DIF_COLORS,
  SEGMENT_INFO
};

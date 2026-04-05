/**
 * SEO SERVICE
 * Análise SEO e sugestões automáticas
 */

/**
 * Calcula SEO score de um artigo
 */
function calculateSEOScore(article) {
  let score = 0;
  const feedback = {};

  // 1. Meta Title (10 pts)
  if (article.headline && article.headline.length >= 50 && article.headline.length <= 60) {
    score += 10;
    feedback.metaTitle = { status: 'ok', suggestion: 'Meta title está otimizado' };
  } else if (article.headline && article.headline.length > 0) {
    score += 5;
    feedback.metaTitle = {
      status: 'warning',
      suggestion: `Meta title deve ter 50-60 caracteres. Atual: ${article.headline.length}`
    };
  } else {
    feedback.metaTitle = { status: 'error', suggestion: 'Meta title obrigatório' };
  }

  // 2. Meta Description (15 pts)
  const description = article.content?.preview || '';
  if (description.length >= 150 && description.length <= 160) {
    score += 15;
    feedback.metaDescription = { status: 'ok', suggestion: 'Meta description está perfeita' };
  } else if (description.length > 0) {
    score += 7;
    feedback.metaDescription = {
      status: 'warning',
      suggestion: `Meta description deve ter 150-160 caracteres. Atual: ${description.length}`
    };
  } else {
    feedback.metaDescription = { status: 'error', suggestion: 'Meta description obrigatória' };
  }

  // 3. H1 Único (10 pts)
  if (article.headline && article.headline.length > 0) {
    score += 10;
    feedback.h1 = { status: 'ok', suggestion: 'H1 está presente' };
  } else {
    feedback.h1 = { status: 'error', suggestion: 'H1 obrigatório' };
  }

  // 4. Imagem com Alt Text (10 pts)
  if (article.image) {
    score += 5;
    if (article.metadata?.imageAlt || article.headline) {
      score += 5;
      feedback.image = { status: 'ok', suggestion: 'Imagem com alt text' };
    } else {
      feedback.image = { status: 'warning', suggestion: 'Adicione alt text na imagem' };
    }
  } else {
    feedback.image = { status: 'error', suggestion: 'Imagem obrigatória para SEO' };
  }

  // 5. Links Internos (10 pts)
  const internalLinkCount = (article.content?.body.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  if (internalLinkCount >= 2) {
    score += 10;
    feedback.internalLinks = { status: 'ok', suggestion: `${internalLinkCount} links internos encontrados` };
  } else if (internalLinkCount > 0) {
    score += 5;
    feedback.internalLinks = {
      status: 'warning',
      suggestion: `Adicione mais links internos. Atual: ${internalLinkCount} (mínimo: 2)`
    };
  } else {
    feedback.internalLinks = { status: 'error', suggestion: 'Adicione pelo menos 2 links internos' };
  }

  // 6. Keywords (15 pts)
  const keywords = article.metadata?.keywords || [];
  if (keywords.length >= 3) {
    score += 15;
    feedback.keywords = { status: 'ok', suggestion: `${keywords.length} keywords encontradas` };
  } else if (keywords.length > 0) {
    score += 7;
    feedback.keywords = {
      status: 'warning',
      suggestion: `Adicione mais keywords. Atual: ${keywords.length} (recomendado: 3+)`
    };
  } else {
    feedback.keywords = { status: 'error', suggestion: 'Adicione pelo menos 3 keywords' };
  }

  // 7. Word Count (15 pts)
  const wordCount = article.metadata?.word_count || 0;
  if (wordCount >= 300 && wordCount <= 2000) {
    score += 15;
    feedback.wordCount = { status: 'ok', suggestion: `${wordCount} palavras (ótimo)` };
  } else if (wordCount >= 150) {
    score += 8;
    feedback.wordCount = {
      status: 'warning',
      suggestion: `${wordCount} palavras. Recomendado: 300-2000`
    };
  } else {
    feedback.wordCount = { status: 'error', suggestion: `Muito pouco conteúdo. Atual: ${wordCount} (mínimo: 150)` };
  }

  // 8. Slug Otimizado (5 pts)
  if (article.slug) {
    const slugPattern = /^[a-z0-9\-]+$/;
    if (slugPattern.test(article.slug) && article.slug.length <= 60) {
      score += 5;
      feedback.slug = { status: 'ok', suggestion: 'Slug otimizado' };
    } else {
      score += 2;
      feedback.slug = {
        status: 'warning',
        suggestion: 'Slug deve conter apenas letras, números e hífens'
      };
    }
  } else {
    feedback.slug = { status: 'error', suggestion: 'Slug obrigatório' };
  }

  return {
    score: Math.min(score, 100),
    maxScore: 100,
    percentage: Math.round((score / 100) * 100),
    feedback
  };
}

/**
 * Gera sugestões automáticas
 */
function generateSuggestions(article) {
  const suggestions = [];

  // Sugestão 1: Meta Title
  if (!article.headline || article.headline.length < 50) {
    suggestions.push({
      priority: 'high',
      type: 'metaTitle',
      title: '📝 Meta Title Curto',
      description: 'Expanda seu título para 50-60 caracteres',
      example: `${article.headline || 'Seu Título'} | DiF Portugal`,
      action: 'Edite o headline para mais de 50 caracteres'
    });
  }

  // Sugestão 2: Keywords
  if (!article.metadata?.keywords || article.metadata.keywords.length < 3) {
    suggestions.push({
      priority: 'high',
      type: 'keywords',
      title: '🏷️ Keywords Faltando',
      description: 'Adicione pelo menos 3 keywords relevantes',
      example: 'investimento, mercado, oportunidade',
      action: 'Identifique os termos principais do seu artigo'
    });
  }

  // Sugestão 3: Word Count
  const wordCount = article.metadata?.word_count || 0;
  if (wordCount < 300) {
    suggestions.push({
      priority: 'high',
      type: 'wordCount',
      title: '📄 Conteúdo Curto',
      description: `Seu artigo tem ${wordCount} palavras. Mínimo recomendado: 300`,
      example: 'Adicione mais detalhes, exemplos e análise',
      action: 'Expanda o corpo do artigo'
    });
  }

  // Sugestão 4: Imagem
  if (!article.image) {
    suggestions.push({
      priority: 'high',
      type: 'image',
      title: '🖼️ Imagem Faltando',
      description: 'Imagens aumentam engajamento e SEO',
      example: 'Use imagens relevantes ao conteúdo',
      action: 'Adicione uma imagem ao artigo'
    });
  }

  // Sugestão 5: Links Internos
  const internalLinkCount = (article.content?.body.match(/\[.*?\]\(\/.*?\)/g) || []).length;
  if (internalLinkCount < 2) {
    suggestions.push({
      priority: 'medium',
      type: 'internalLinks',
      title: '🔗 Links Internos',
      description: 'Adicione links para outros artigos relevantes',
      example: '[Leia também: Reforma Tributária](/articulo/reforma)',
      action: 'Insira pelo menos 2 links internos'
    });
  }

  // Sugestão 6: Meta Description
  const description = article.content?.preview || '';
  if (description.length < 150) {
    suggestions.push({
      priority: 'medium',
      type: 'metaDescription',
      title: '📋 Meta Description',
      description: 'Expanda a descrição do artigo para 150-160 caracteres',
      example: 'Uma breve descrição envolvente que apareça nos resultados de busca',
      action: 'Edite o preview/excerpt do artigo'
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Extrai keywords automaticamente do conteúdo
 */
function extractKeywordsFromContent(text) {
  if (!text) return [];

  // Remove stopwords comuns em português
  const stopwords = new Set([
    'o', 'a', 'e', 'é', 'ou', 'para', 'por', 'com', 'sem', 'de', 'da', 'do',
    'em', 'um', 'uma', 'aos', 'às', 'aos', 'pelo', 'pela', 'no', 'na', 'nos',
    'nas', 'este', 'esse', 'aquele', 'que', 'qual', 'quando', 'onde', 'como',
    'mas', 'se', 'não', 'sim', 'está', 'são', 'foi', 'será', 'tem', 'temos'
  ]);

  // Divide em palavras, remove pontuação
  const words = text
    .toLowerCase()
    .replace(/[^a-záéíóúàâãêõ\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 4 && !stopwords.has(word));

  // Conta frequência
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Retorna top 5 palavras mais frequentes
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Calcula readability score
 */
function calculateReadability(text) {
  if (!text) return 0;

  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).length;
  const paragraphs = text.split(/\n\n+/).length;

  // Flesch-Kincaid simplificado
  const avgWordsPerSentence = words / sentences;
  const avgSentencesPerParagraph = sentences / paragraphs;

  let score = 100;
  score -= avgWordsPerSentence * 0.4;
  score -= avgSentencesPerParagraph * 0.5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
  calculateSEOScore,
  generateSuggestions,
  extractKeywordsFromContent,
  calculateReadability
};

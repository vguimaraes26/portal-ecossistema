const axios = require('axios');

// Headers realistas para evitar bloqueios
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'DNT': '1'
};

// Delay entre requisições
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch com retry e timeout
async function fetchWithRetry(url, maxRetries = 3, timeout = 10000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: DEFAULT_HEADERS,
        timeout,
        maxRedirects: 5
      });
      return response.data;
    } catch (error) {
      console.log(`Tentativa ${attempt + 1}/${maxRetries} falhou para ${url}`);

      if (attempt === maxRetries - 1) throw error;

      // Backoff exponencial
      const delayMs = 2000 * Math.pow(2, attempt);
      console.log(`Aguardando ${delayMs}ms antes de tentar novamente...`);
      await sleep(delayMs);
    }
  }
}

// Limpar e normalizar texto
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Remove múltiplos espaços
    .replace(/\n\n+/g, '\n') // Remove múltiplas quebras
    .trim();
}

// Validar URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Resolver URL relativa
function resolveUrl(baseUrl, relativeUrl) {
  if (isValidUrl(relativeUrl)) return relativeUrl;
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return null;
  }
}

module.exports = {
  DEFAULT_HEADERS,
  sleep,
  fetchWithRetry,
  cleanText,
  isValidUrl,
  resolveUrl
};

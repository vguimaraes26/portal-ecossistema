/**
 * VERSIONING SERVICE
 * Gerencia histórico de versões e mudanças de artigos
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const VERSIONS_FILE = path.join(__dirname, '../../..', 'articles_versions.json');

/**
 * Carrega histórico de versões
 */
function loadVersions() {
  try {
    if (!fs.existsSync(VERSIONS_FILE)) {
      return { versions: [], metadata: { createdAt: new Date().toISOString() } };
    }
    return JSON.parse(fs.readFileSync(VERSIONS_FILE, 'utf8'));
  } catch (error) {
    console.error('[VERSIONING] Erro ao carregar versões:', error.message);
    return { versions: [], metadata: { createdAt: new Date().toISOString() } };
  }
}

/**
 * Salva histórico de versões
 */
function saveVersions(versionData) {
  try {
    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versionData, null, 2));
  } catch (error) {
    console.error('[VERSIONING] Erro ao salvar versões:', error.message);
    throw error;
  }
}

/**
 * Compara dois objetos e retorna diferenças
 */
function getChanges(previousData, currentData) {
  const changes = {};
  const fieldsToTrack = ['headline', 'body', 'segment', 'image', 'metadata'];

  fieldsToTrack.forEach(field => {
    if (previousData[field] !== currentData[field]) {
      changes[field] = {
        before: previousData[field],
        after: currentData[field]
      };
    }
  });

  return changes;
}

/**
 * Cria nova versão de um artigo
 */
function createVersion(articleId, previousData, currentData, changeType = 'edit', user = 'admin') {
  const versionData = loadVersions();
  const changes = getChanges(previousData, currentData);

  if (Object.keys(changes).length === 0 && changeType === 'edit') {
    return null; // Sem mudanças
  }

  const version = {
    versionId: uuidv4(),
    articleId,
    versionNumber: (versionData.versions.filter(v => v.articleId === articleId).length) + 1,
    timestamp: new Date().toISOString(),
    user,
    changeType, // 'edit', 'create', 'publish', 'rollback'
    changes,
    snapshot: { ...previousData } // Backup completo da versão anterior
  };

  versionData.versions.push(version);
  versionData.metadata.lastUpdated = new Date().toISOString();
  saveVersions(versionData);

  console.log(`[VERSIONING] Nova versão criada: ${version.versionId}`);
  return version;
}

/**
 * Retorna todas as versões de um artigo
 */
function getAllVersions(articleId) {
  const versionData = loadVersions();
  return versionData.versions
    .filter(v => v.articleId === articleId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Retorna uma versão específica
 */
function getVersion(versionId) {
  const versionData = loadVersions();
  return versionData.versions.find(v => v.versionId === versionId);
}

/**
 * Rollback para uma versão anterior
 */
function rollbackToVersion(articleId, versionId) {
  const version = getVersion(versionId);

  if (!version || version.articleId !== articleId) {
    throw new Error('Versão não encontrada ou não pertence a este artigo');
  }

  if (!version.snapshot) {
    throw new Error('Snapshot não disponível para rollback');
  }

  // Cria nova versão registrando o rollback
  const versionData = loadVersions();
  const rollbackVersion = {
    versionId: uuidv4(),
    articleId,
    versionNumber: (versionData.versions.filter(v => v.articleId === articleId).length) + 1,
    timestamp: new Date().toISOString(),
    user: 'admin',
    changeType: 'rollback',
    changes: {
      rollback_from: {
        before: `v${version.versionNumber}`,
        after: 'latest'
      }
    },
    snapshot: { ...version.snapshot },
    rolledBackFromVersion: versionId
  };

  versionData.versions.push(rollbackVersion);
  versionData.metadata.lastUpdated = new Date().toISOString();
  saveVersions(versionData);

  console.log(`[VERSIONING] Rollback executado: ${versionId}`);
  return version.snapshot; // Retorna dados a restaurar
}

/**
 * Compara duas versões (diff simples)
 */
function compareVersions(versionId1, versionId2) {
  const v1 = getVersion(versionId1);
  const v2 = getVersion(versionId2);

  if (!v1 || !v2) {
    throw new Error('Uma ou ambas versões não encontradas');
  }

  return {
    version1: {
      versionId: v1.versionId,
      timestamp: v1.timestamp,
      versionNumber: v1.versionNumber
    },
    version2: {
      versionId: v2.versionId,
      timestamp: v2.timestamp,
      versionNumber: v2.versionNumber
    },
    differences: getChanges(v1.snapshot, v2.snapshot)
  };
}

/**
 * Delete todas as versões de um artigo
 */
function deleteArticleVersions(articleId) {
  const versionData = loadVersions();
  versionData.versions = versionData.versions.filter(v => v.articleId !== articleId);
  versionData.metadata.lastUpdated = new Date().toISOString();
  saveVersions(versionData);

  console.log(`[VERSIONING] Versões deletadas: artigo ${articleId}`);
}

/**
 * Estatísticas de versioning
 */
function getVersionStats() {
  const versionData = loadVersions();
  const stats = {
    totalVersions: versionData.versions.length,
    articleCount: new Set(versionData.versions.map(v => v.articleId)).size,
    changeTypes: {},
    lastUpdate: versionData.metadata.lastUpdated
  };

  versionData.versions.forEach(v => {
    stats.changeTypes[v.changeType] = (stats.changeTypes[v.changeType] || 0) + 1;
  });

  return stats;
}

module.exports = {
  createVersion,
  getAllVersions,
  getVersion,
  rollbackToVersion,
  compareVersions,
  deleteArticleVersions,
  getVersionStats,
  loadVersions,
  saveVersions
};

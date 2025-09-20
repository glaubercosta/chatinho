/**
 * Jest Global Teardown
 * Força limpeza de recursos para evitar handles abertos
 */

module.exports = async () => {
  // Limpar nock
  const nock = require('nock');
  nock.cleanAll();
  nock.restore();

  // Forçar garbage collection se disponível
  if (global.gc) {
    global.gc();
  }

  // Aguardar um pouco para cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
};
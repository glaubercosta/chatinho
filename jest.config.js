module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
  // Configurações para evitar memory leaks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Configurações específicas para testes com nock
  modulePathIgnorePatterns: ['<rootDir>/coverage/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  // Cleanup automático
  globalTeardown: '<rootDir>/tests/teardown.js'
};
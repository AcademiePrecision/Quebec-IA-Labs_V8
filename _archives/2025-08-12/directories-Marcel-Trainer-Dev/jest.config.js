// Jest Configuration for Marcel V7.0
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js',
    '!test/**',
    '!node_modules/**',
    '!coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/public/',
    '/scripts/'
  ],
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true
};
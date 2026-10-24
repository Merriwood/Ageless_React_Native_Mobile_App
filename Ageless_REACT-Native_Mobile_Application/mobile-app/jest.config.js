module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  // Run every test in US Eastern time (see __tests__/global-setup.js)
  globalSetup: '<rootDir>/__tests__/global-setup.js',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-css-interop/runtime/native$': '<rootDir>/__tests__/mocks/react-native-css-interop-native.js',
    '^react-native-css-interop/runtime/native/(.*)': '<rootDir>/__tests__/mocks/react-native-css-interop-native.js',
    '^react-native-css-interop$': '<rootDir>/__tests__/mocks/react-native-css-interop.js',
  },
  transform: {
    '^.+\.(ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.ts', '/__tests__/global-setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'api/**/*.ts',
    'hooks/**/*.ts',
    'context/**/*.tsx',
    'utils/**/*.ts',
    'lib/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

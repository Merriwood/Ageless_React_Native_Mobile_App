module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/__tests__/**/*.test.ts',
    '**/__tests__/**/__tests__/**/*.test.tsx',
    '**/__tests__/**/integration/*.test.ts',
    '**/__tests__/**/integration/*.test.tsx',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.ts'],
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
};

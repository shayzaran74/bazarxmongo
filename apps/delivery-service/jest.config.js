module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@barterborsa/shared-core$': '<rootDir>/../../packages/shared/shared-core/src/index.ts',
    '^@barterborsa/shared-persistence$': '<rootDir>/../../packages/shared/shared-persistence/src/index.ts',
    '^@barterborsa/shared-messaging$': '<rootDir>/../../packages/shared/shared-messaging/src/index.ts',
    '^@barterborsa/shared-observability$': '<rootDir>/../../packages/shared/shared-observability/src/index.ts',
    '^@barterborsa/shared-nest$': '<rootDir>/../../packages/shared/shared-nest/src/index.ts',
  },
};

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
    '^@barterborsa/shared-core$': '<rootDir>/../../packages/shared/shared-core/src',
    '^@barterborsa/shared-persistence$': '<rootDir>/../../packages/shared/shared-persistence/src',
    '^@barterborsa/shared-security$': '<rootDir>/../../packages/shared/shared-security/src',
    '^@barterborsa/shared-nest$': '<rootDir>/../../packages/shared/shared-nest/src',
  },
};

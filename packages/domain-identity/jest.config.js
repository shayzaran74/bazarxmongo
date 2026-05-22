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
    '^@barterborsa/shared-core$': '<rootDir>/../shared/shared-core/src',
    '^@barterborsa/shared-persistence$': '<rootDir>/../shared/shared-persistence/src',
    '^@barterborsa/shared-security$': '<rootDir>/../shared/shared-security/src',
  },
};

// packages/domain-identity/jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@barterborsa/shared-core(|/.*)$': '<rootDir>/../../../packages/shared/shared-core/src/$1',
    '^@barterborsa/shared-types(|/.*)$': '<rootDir>/../../../packages/shared/shared-types/src/$1',
    '^@barterborsa/shared-security(|/.*)$': '<rootDir>/../../../packages/shared/shared-security/src/$1',
  },
};

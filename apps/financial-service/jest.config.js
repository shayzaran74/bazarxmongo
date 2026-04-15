// apps/financial-service/jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      allowJs: true,
    }],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@barterborsa/shared-core(|/.*)$': '<rootDir>/../../packages/shared/shared-core/src/$1',
    '^@barterborsa/shared-persistence(|/.*)$': '<rootDir>/../../packages/shared/shared-persistence/src/$1',
    '^@barterborsa/shared-messaging(|/.*)$': '<rootDir>/../../packages/shared/shared-messaging/src/$1',
    '^@barterborsa/shared-observability(|/.*)$': '<rootDir>/../../packages/shared/shared-observability/src/$1',
  },
};

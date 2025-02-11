module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^domain/entities/(.*)$': '<rootDir>/src/domain/entities/$1',
    '^infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  }
};

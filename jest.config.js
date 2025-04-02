module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^api/(.*)$': '<rootDir>/src/api/$1',
    '^application/(.*)$': '<rootDir>/src/application/$1',
    '^core/(.*)$': '<rootDir>/src/core/$1',
    '^domain/(.*)$': '<rootDir>/src/domain/$1',
    '^infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1'
  }
};

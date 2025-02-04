module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^entities/(.*)$': '<rootDir>/src/entities/$1',
    '^infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  }
};

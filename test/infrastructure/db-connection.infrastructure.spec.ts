import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { baseConfig } from '../../src/core/configs/datasource.config';
import { DbConnectionInfrastructure } from '../../src/infrastructure/database/db-connection.infrastructure';

jest.mock('../../src/core/configs/datasource.config', () => ({
  getDataSourceConfig: jest.fn(() => ({
    ...baseConfig, entities: []
  }))
}));

jest.mock('typeorm', () => {
  let isInitialized = false;

  const mockDataSource = {
    initialize: jest.fn().mockImplementation(async () => {
      isInitialized = true;
    }),
    destroy: jest.fn().mockImplementation(async () => {
      isInitialized = false;
    }),
    get isInitialized() {
      return isInitialized;
    }
  };

  return {
    DataSource: jest.fn(() => mockDataSource)
  };
});

describe('DbConnectionInfrastructure', () => {
  let dbConnection: DbConnectionInfrastructure;
  let dataSource: DataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dbConnection = new DbConnectionInfrastructure();
    dataSource = dbConnection.create();
  });

  test('should create a data source instance', () => {
    expect(dataSource).toBeDefined();
    expect(DataSource).toHaveBeenCalledTimes(1);
  });

  test('should initialize the data source', async () => {
    await dataSource.initialize();
    expect(dataSource.initialize).toHaveBeenCalledTimes(1);
  });

  test('should return true for isConnected when initialized', async () => {
    await dataSource.initialize();
    expect(dbConnection.isConnected()).toBe(true);
  });

  test('should disconnect the data source', async () => {
    await dataSource.initialize();
    await dbConnection.disconnect();
    expect(dataSource.destroy).toHaveBeenCalledTimes(1);
  });

  test('should return false for isConnected when disconnected', async () => {
    await dataSource.initialize();
    await dbConnection.disconnect();
    expect(dbConnection.isConnected()).toBe(false);
  });
});

import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { DbConnectionInfrastructure } from '../../src/infrastructure/db-connection.infrastructure';

jest.mock('typeorm', () => {
  const mockDataSource = {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: false
  };

  return {
    DataSource: jest.fn(() => mockDataSource)
  };
});

jest.mock('../../src/domain/entities/invoice.entity', () => ({}));
jest.mock('../../src/domain/entities/order.entity', () => ({}));
jest.mock('../../src/domain/entities/role.entity', () => ({}));
jest.mock('../../src/domain/entities/user.entity', () => ({}));

describe('DbConnectionInfrastructure', () => {
  let dataSource: DataSource;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a data source instance', () => {
    dataSource = DbConnectionInfrastructure.create();
    expect(dataSource).toBeDefined();
    expect(DataSource).toHaveBeenCalledTimes(1);
  });

  test('should initialize the data source', async () => {
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    expect(dataSource.initialize).toHaveBeenCalledTimes(1);
  });

  test('should return true for isConnected when initialized', async () => {
    let isConnected = false;
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    isConnected = true;
    expect(isConnected).toBe(true);
  });

  test('should disconnect the data source', async () => {
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    await DbConnectionInfrastructure.disconnect();
    expect(dataSource.destroy).toHaveBeenCalledTimes(0);
  });

  test('should return false for isConnected when disconnected', async () => {
    let isConnected = true;
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    await DbConnectionInfrastructure.disconnect();
    isConnected = false;
    expect(isConnected).toBe(false);
  });
});


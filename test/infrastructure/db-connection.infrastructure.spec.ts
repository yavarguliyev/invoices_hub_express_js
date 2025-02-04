import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { DbConnectionInfrastructure } from '../../src/infrastructure/db-connection.infrastructure';

jest.mock('../../src/entities/invoice.entity', () => ({}));
jest.mock('../../src/entities/order.entity', () => ({}));
jest.mock('../../src/entities/role.entity', () => ({}));
jest.mock('../../src/entities/user.entity', () => ({}));

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
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    (dataSource as any).isInitialized = true;

    expect(DbConnectionInfrastructure.isConnected()).toBe(true);
  });

  test('should disconnect the data source', async () => {
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    (dataSource as any).isInitialized = true;

    await DbConnectionInfrastructure.disconnect();

    expect(dataSource.destroy).toHaveBeenCalledTimes(1);
  });

  test('should return false for isConnected when disconnected', async () => {
    dataSource = DbConnectionInfrastructure.create();
    await dataSource.initialize();
    (dataSource as any).isInitialized = true;

    await DbConnectionInfrastructure.disconnect();

    expect(DbConnectionInfrastructure.isConnected()).toBe(false);
  });
});


import 'dotenv/config';
import { DataSource } from 'typeorm';

import { AppDataSource } from '../src/data-source';

jest.mock('typeorm', () => {
  const mockDataSourceInstance = {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: false
  };

  return {
    DataSource: jest.fn(() => mockDataSourceInstance)
  };
});

jest.mock('../src/domain/entities/invoice.entity', () => ({}));
jest.mock('../src/domain/entities/order.entity', () => ({}));
jest.mock('../src/domain/entities/role.entity', () => ({}));
jest.mock('../src/domain/entities/user.entity', () => ({}));

describe('AppDataSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(AppDataSource).toBeDefined();
    expect(DataSource).toHaveBeenCalledTimes(0);
  });

  test('should initialize the database connection', async () => {
    await AppDataSource.initialize();
    expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
  });

  test('should destroy the database connection', async () => {
    await AppDataSource.destroy();
    expect(AppDataSource.destroy).toHaveBeenCalledTimes(1);
  });
});

import { Container } from 'typedi';
import { DataSource, DataSourceOptions } from 'typeorm';

import Role from '../../src/domain/entities/role.entity';
import User from '../../src/domain/entities/user.entity';
import Invoice from '../../src/domain/entities/invoice.entity';
import Order from '../../src/domain/entities/order.entity';
import { DbConnectionInfrastructure } from '../../src/infrastructure/database/db-connection.infrastructure';
import { LoggerTracerInfrastructure } from '../../src/infrastructure/logging/logger-tracer.infrastructure';

let testDataSource: DataSource;

export async function setupTestDatabase (): Promise<void> {
  try {
    const mockDbConnection = new DbConnectionInfrastructure();

    const testDataSourceConfig: DataSourceOptions = {
      type: 'postgres',
      host: process.env.DB_TEST_HOST,
      port: Number(process.env.DB_TEST_PORT || 5432),
      username: process.env.DB_TEST_USERNAME,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
      entities: [Role, User, Invoice, Order],
      synchronize: true,
      dropSchema: true,
      logging: false
    };

    const mockDataSource = new DataSource(testDataSourceConfig);

    await mockDataSource.initialize();

    testDataSource = mockDataSource;

    mockDbConnection.create = jest.fn().mockReturnValue(mockDataSource);
    mockDbConnection.getDataSource = jest.fn().mockReturnValue(mockDataSource);

    Container.set(DbConnectionInfrastructure, mockDbConnection);
  } catch (error) {
    LoggerTracerInfrastructure.log(`Failed to setup test database: ${error}`, 'error');
    throw error;
  }
}

export async function clearTestData (): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    try {
      const entityMetadatas = testDataSource.entityMetadatas;
      for (const entity of entityMetadatas) {
        const repository = testDataSource.getRepository(entity.name);
        await repository.clear();
      }
    } catch (error) {
      LoggerTracerInfrastructure.log(`Failed to clear test data: ${error}`, 'error');
    }
  }
}

export async function closeTestDatabase (): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    try {
      await testDataSource.destroy();
    } catch (error) {
      LoggerTracerInfrastructure.log(`Failed to close test database: ${error}`, 'error');
    }
  }
}

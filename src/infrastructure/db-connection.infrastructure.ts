import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import Invoice from 'entities/invoice.entity';
import Oder from 'entities/order.entity';
import Role from 'entities/role.entity';
import User from 'entities/user.entity';

export class DbConnectionInfrastructure {
  private static dataSource?: DataSource;

  static create (): DataSource {
    if (!this.dataSource) {
      const dataSourceOptions: DataSourceOptions = {
        type: 'postgres',
        host: process.env.DB_DEFAULT_HOST,
        port: Number(process.env.DB_DEFAULT_PORT),
        username: process.env.DB_DEFAULT_USERNAME,
        password: process.env.DB_DEFAULT_PASSWORD,
        database: process.env.DB_DEFAULT_DATABASE,
        entities: [Invoice, Oder, Role, User],
        synchronize: false,
        logging: false
      };

      this.dataSource = new DataSource(dataSourceOptions);
    }

    return this.dataSource;
  }

  static async disconnect (): Promise<void> {
    if (this?.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      delete this.dataSource;
    }
  }

  static isConnected (): boolean {
    return !!this.dataSource?.isInitialized;
  }

  static getDataSource (): DataSource | undefined {
    return this.dataSource;
  }
}

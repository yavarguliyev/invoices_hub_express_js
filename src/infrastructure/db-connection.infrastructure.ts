import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

import User from 'entities/user.entity';
import Role from 'entities/role.entity';

export class DbConnectionInfrastructure {
  private static dataSource: DataSource | null = null;

  static create (): DataSource {
    if (!this.dataSource) {
      const dataSourceOptions: DataSourceOptions = {
        type: 'postgres',
        host: process.env.DB_DEFAULT_HOST,
        port: Number(process.env.DB_DEFAULT_PORT),
        username: process.env.DB_DEFAULT_USERNAME,
        password: process.env.DB_DEFAULT_PASSWORD,
        database: process.env.DB_DEFAULT_DATABASE,
        entities: [User, Role],
        synchronize: false,
        logging: false
      };

      this.dataSource = new DataSource(dataSourceOptions);
    }

    return this.dataSource;
  }

  static async disconnect (): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
    }
  }
}

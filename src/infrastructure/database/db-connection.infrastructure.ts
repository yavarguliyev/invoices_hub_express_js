import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { getDataSourceConfig } from 'core/configs/datasource.config';

export class DbConnectionInfrastructure {
  private dataSource?: DataSource;

  create (): DataSource {
    if (!this.dataSource) {
      this.dataSource = new DataSource(getDataSourceConfig());
    }

    return this.dataSource;
  }

  async disconnect (): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = undefined;
    }
  }

  isConnected (): boolean {
    return !!this.dataSource?.isInitialized;
  }

  getDataSource (): DataSource | undefined {
    return this.dataSource;
  }
}

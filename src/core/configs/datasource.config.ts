import dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

import Invoice from 'domain/entities/invoice.entity';
import Oder from 'domain/entities/order.entity';
import Role from 'domain/entities/role.entity';
import User from 'domain/entities/user.entity';

dotenv.config();

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_DEFAULT_HOST,
  port: Number(process.env.DB_DEFAULT_PORT),
  username: process.env.DB_DEFAULT_USERNAME,
  password: process.env.DB_DEFAULT_PASSWORD,
  database: process.env.DB_DEFAULT_DATABASE,
  entities: [Invoice, Oder, Role, User],
  synchronize: false,
  logging: false,
  subscribers: []
};

const getDataSourceConfig = (includeMigrations = false): DataSourceOptions => {
  return includeMigrations
    ? { ...baseConfig, migrations: ['migrations/*.ts'] }
    : baseConfig;
};

export { baseConfig, getDataSourceConfig };

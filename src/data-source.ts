import { DataSource } from 'typeorm';

import User from 'entities/user.entity';
import Role from 'entities/role.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_DEFAULT_HOST,
  port: Number(process.env.DB_DEFAULT_PORT),
  username: process.env.DB_DEFAULT_USERNAME,
  password: process.env.DB_DEFAULT_PASSWORD,
  database: process.env.DB_DEFAULT_DATABASE,
  entities: [User, Role],
  synchronize: false,
  logging: false,
  subscribers: [],
  migrations: []
});

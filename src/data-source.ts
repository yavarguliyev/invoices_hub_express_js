import { DataSource } from 'typeorm';

import Invoice from 'entities/invoice.entity';
import Oder from 'entities/order.entity';
import Role from 'entities/role.entity';
import User from 'entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_DEFAULT_HOST,
  port: Number(process.env.DB_DEFAULT_PORT),
  username: process.env.DB_DEFAULT_USERNAME,
  password: process.env.DB_DEFAULT_PASSWORD,
  database: process.env.DB_DEFAULT_DATABASE,
  entities: [Invoice, Oder, Role, User],
  synchronize: false,
  logging: false,
  subscribers: [],
  migrations: []
});

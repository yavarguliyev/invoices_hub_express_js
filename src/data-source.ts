import 'dotenv/config';
import { DataSource } from 'typeorm';

import Invoice from 'domain/entities/invoice.entity';
import Oder from 'domain/entities/order.entity';
import Role from 'domain/entities/role.entity';
import User from 'domain/entities/user.entity';

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
  migrations: ['migrations/*.ts']
});

import { Container } from 'typedi';
import { useContainer as typeormUseContainer } from 'typeorm';
import { useContainer as routingControllersUseContainer } from 'routing-controllers';

import { AuthController } from 'api/v1/auth.controller';
import { HealthcheckController } from 'api/v1/healthcheck.controller';
import { InvoicesController } from 'api/v1/invoices.controller';
import { OrdersController } from 'api/v1/orders.controller';
import { RolesController } from 'api/v1/roles.controller';
import { UsersController } from 'api/v1/users.controller';
import { GracefulShutdownHelper } from 'application/helpers/graceful-shutdown.helper';
import { AuthService } from 'application/services/auth.service';
import { HealthcheckService } from 'application/services/healthcheck.service';
import { InvoiceService } from 'application/services/invoice.service';
import { OrderService } from 'application/services/order.service';
import { RoleService } from 'application/services/role.service';
import { UserService } from 'application/services/user.service';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { registerService } from 'application/helpers/utility-functions.helper';
import { HelmetMiddleware } from 'core/middlewares/helmet.middleware';
import { GlobalErrorHandlerMiddleware } from 'core/middlewares/error-handler.middleware';
import Invoice from 'domain/entities/invoice.entity';
import Order from 'domain/entities/order.entity';
import Role from 'domain/entities/role.entity';
import User from 'domain/entities/user.entity';
import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { OrderRepository } from 'domain/repositories/order.repository';
import { RoleRepository } from 'domain/repositories/role.repository';
import { UserRepository } from 'domain/repositories/user.repository';
import { DbConnectionInfrastructure } from 'infrastructure/database/db-connection.infrastructure';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';
import { DataLoaderInfrastructure } from 'infrastructure/database/data-loader.infrastructure';
import { ContainerKeys } from 'application/ioc/static/container-keys';
import { ClusterInfrastructure } from 'infrastructure/cluster/cluster.infrastructure';
import { WorkerThreadsInfrastructure } from 'infrastructure/workers/worker-threads.infrastructure';
import { ExpressServerInfrastructure } from 'infrastructure/server/express-server.infrastructure';

export function configureContainers () {
  typeormUseContainer(Container);
  routingControllersUseContainer(Container);
};

export async function configureInfrastructures () {
  const rabbitMQ = new RabbitMQInfrastructure();
  await rabbitMQ.initialize();

  const redis = new RedisInfrastructure();
  await redis.initialize();

  const dbConnection = new DbConnectionInfrastructure();
  const dataSource = await dbConnection.create();
  await dataSource.initialize();

  const invoiceDataLoader = new DataLoaderInfrastructure<Invoice>(dataSource.getRepository(Invoice));
  const orderDataLoader = new DataLoaderInfrastructure<Order>(dataSource.getRepository(Order));
  const roleDataLoader = new DataLoaderInfrastructure<Role>(dataSource.getRepository(Role));
  const userDataLoader = new DataLoaderInfrastructure<User>(dataSource.getRepository(User));

  Container.set(RabbitMQInfrastructure, rabbitMQ);
  Container.set(RedisInfrastructure, redis);
  Container.set(DbConnectionInfrastructure, dbConnection);
  Container.set(ContainerKeys.INVOICE_DATA_LOADER, invoiceDataLoader);
  Container.set(ContainerKeys.ORDER_DATA_LOADER, orderDataLoader);
  Container.set(ContainerKeys.ROLE_DATA_LOADER, roleDataLoader);
  Container.set(ContainerKeys.USER_DATA_LOADER, userDataLoader);
};

export function configureLifecycleServices () {
  Container.set(HelmetMiddleware, new HelmetMiddleware());
  Container.set(GlobalErrorHandlerMiddleware, new GlobalErrorHandlerMiddleware());
  Container.set(ClusterInfrastructure, new ClusterInfrastructure());
  Container.set(WorkerThreadsInfrastructure, new WorkerThreadsInfrastructure());
  Container.set(GracefulShutdownHelper, new GracefulShutdownHelper());
  Container.set(ExpressServerInfrastructure, new ExpressServerInfrastructure());
}

export function configureControllersAndServices () {
  registerService({ id: ContainerItems.IAuthService, service: AuthService });
  registerService({ id: ContainerItems.IHealthcheckService, service: HealthcheckService });
  registerService({ id: ContainerItems.IInvoiceService, service: InvoiceService });
  registerService({ id: ContainerItems.IOrderService, service: OrderService });
  registerService({ id: ContainerItems.IRoleService, service: RoleService });
  registerService({ id: ContainerItems.IUserService, service: UserService });

  const dbConnection = Container.get<DbConnectionInfrastructure>(DbConnectionInfrastructure);
  const dataSource = dbConnection.getDataSource();

  if (!dataSource) {
    throw new Error('Database connection is not initialized.');
  }

  Container.set(InvoiceRepository, dataSource.getRepository(Invoice));
  Container.set(OrderRepository, dataSource.getRepository(Order));
  Container.set(RoleRepository, dataSource.getRepository(Role));
  Container.set(UserRepository, dataSource.getRepository(User));

  ContainerHelper
    .registerController(AuthController)
    .registerController(HealthcheckController)
    .registerController(InvoicesController)
    .registerController(OrdersController)
    .registerController(RolesController)
    .registerController(UsersController);
};

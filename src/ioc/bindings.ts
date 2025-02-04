import { Container } from 'typedi';
import { useContainer as typeormUseContainer } from 'typeorm';
import { useContainer as routingControllersUseContainer } from 'routing-controllers';

import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { UserService } from 'services/user.service';
import { UsersController } from 'controllers/v1/users.controller';
import { HealthcheckController } from 'controllers/v1/healthcheck.controller';
import { ExpressServerInfrastructure } from 'infrastructure/express-server.infrastructure';
import { ErrorHandlerMiddleware } from 'middlewares/error-handler.middleware';
import { registerService } from 'helpers/utility-functions.helper';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { InvoicesController } from 'controllers/v1/invoices.controller';
import { AuthController } from 'controllers/v1/auth.controller';
import { AuthService } from 'services/auth.service';
import { RoleService } from 'services/role.service';
import { RolesController } from 'controllers/v1/roles.controller';
import { InvoiceService } from 'services/invoice.service';
import { OrderService } from 'services/order.service';
import { OrdersController } from 'controllers/v1/orders.controller';
import { HealthcheckService } from 'services/healthcheck.service';
import Invoice from 'entities/invoice.entity';
import Order from 'entities/order.entity';
import Role from 'entities/role.entity';
import User from 'entities/user.entity';
import { InvoiceRepository } from 'repositories/invoice.repository';
import { OrderRepository } from 'repositories/order.repository';
import { RoleRepository } from 'repositories/role.repository';
import { UserRepository } from 'repositories/user.repository';
import { HelmetMiddleware } from 'middlewares/helmet.middleware';

export function configureContainers () {
  typeormUseContainer(Container);
  routingControllersUseContainer(Container);
};

export async function configureRepositories () {
  try {
    const dataSource = await DbConnectionInfrastructure.create();
    await dataSource.initialize();

    if (dataSource.isInitialized) {
      const invoiceRepository = dataSource.getRepository(Invoice);
      const orderRepository = dataSource.getRepository(Order);
      const roleRepository = dataSource.getRepository(Role);
      const userRepository = dataSource.getRepository(User);

      Container.set(InvoiceRepository, invoiceRepository);
      Container.set(OrderRepository, orderRepository);
      Container.set(RoleRepository, roleRepository);
      Container.set(UserRepository, userRepository);
    }
  } catch (error) {
    LoggerTracerInfrastructure.log(`Error initializing data source: ${error}`, 'error');
  }
};

export function configureInfrastructures () {
  Container.set(ExpressServerInfrastructure, new ExpressServerInfrastructure());
};

export function configureMiddlewares () {
  Container.set(HelmetMiddleware, new HelmetMiddleware());
  Container.set(ErrorHandlerMiddleware, new ErrorHandlerMiddleware());
};

export function configureControllersAndServices () {
  registerService(ContainerItems.IAuthService, AuthService);
  registerService(ContainerItems.IHealthcheckService, HealthcheckService);
  registerService(ContainerItems.IInvoiceService, InvoiceService);
  registerService(ContainerItems.IOrderService, OrderService);
  registerService(ContainerItems.IRoleService, RoleService);
  registerService(ContainerItems.IUserService, UserService);

  ContainerHelper
    .registerController(AuthController)
    .registerController(HealthcheckController)
    .registerController(InvoicesController)
    .registerController(OrdersController)
    .registerController(RolesController)
    .registerController(UsersController);
};

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
import User from 'entities/user.entity';
import Role from 'entities/role.entity';
import { UserRepository } from 'repositories/user.repository';
import { RoleRepository } from 'repositories/role.repository';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { InvoicesController } from 'controllers/v1/invoices.controller';
import { AuthController } from 'controllers/v1/auth.controller';
import { AuthService } from 'services/auth.service';
import { RoleService } from 'services/role.service';
import Invoice from 'entities/invoices.entity';
import { InvoiceRepository } from 'repositories/invoice.repository';
import { RolesController } from 'controllers/v1/roles.controller';
import { InvoiceService } from 'services/invoice.service';

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
      const roleRepository = dataSource.getRepository(Role);
      const userRepository = dataSource.getRepository(User);

      Container.set(InvoiceRepository, invoiceRepository);
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
  Container.set(ErrorHandlerMiddleware, new ErrorHandlerMiddleware());
};

export function configureControllersAndServices () {
  registerService(ContainerItems.IAuthService, AuthService);
  registerService(ContainerItems.IInvoiceService, InvoiceService);
  registerService(ContainerItems.IRoleService, RoleService);
  registerService(ContainerItems.IUserService, UserService);

  ContainerHelper
    .registerController(AuthController)
    .registerController(HealthcheckController)
    .registerController(InvoicesController)
    .registerController(RolesController)
    .registerController(UsersController);
};

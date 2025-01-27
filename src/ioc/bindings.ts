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

export function configureContainers () {
  typeormUseContainer(Container);
  routingControllersUseContainer(Container);
};

export async function configureRepositories () {
  try {
    const dataSource = await DbConnectionInfrastructure.create();
    await dataSource.initialize();

    if (dataSource.isInitialized) {
      const userRepository = dataSource.getRepository(User);
      const roleRepository = dataSource.getRepository(Role);

      Container.set(UserRepository, userRepository);
      Container.set(RoleRepository, roleRepository);
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
  registerService(ContainerItems.IUserService, UserService);

  ContainerHelper
    .registerController(HealthcheckController)
    .registerController(UsersController);
};

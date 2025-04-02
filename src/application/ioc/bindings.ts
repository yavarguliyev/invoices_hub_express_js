import { Constructable, Container } from 'typedi';
import { useContainer as typeormUseContainer } from 'typeorm';
import cluster from 'cluster';
import { useContainer as routingControllersUseContainer } from 'routing-controllers';
import http from 'http';

import { AuthController } from 'api/v1/auth.controller';
import { HealthcheckController } from 'api/v1/healthcheck.controller';
import { InvoicesController } from 'api/v1/invoices.controller';
import { OrdersController } from 'api/v1/orders.controller';
import { RolesController } from 'api/v1/roles.controller';
import { UsersController } from 'api/v1/users.controller';
import { HealthcheckService } from 'application/services/healthcheck.service';
import { GracefulShutdownHelper } from 'application/helpers/graceful-shutdown.helper';
import { AuthService } from 'application/services/auth.service';
import { InvoiceService } from 'application/services/invoice.service';
import { NotificationService } from 'application/services/notification.service';
import { OrderService } from 'application/services/order.service';
import { RoleService } from 'application/services/role.service';
import { UserService } from 'application/services/user.service';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { getErrorMessage, handleProcessSignals, registerService } from 'application/helpers/utility-functions.helper';
import { OrderRabbitMQSubscriber } from 'application/rabbitMQ/order-rabbitMQ.subscriber';
import { InvoiceRabbitMQSubscriber } from 'application/rabbitMQ/invoice-rabbitMQ.subscriber';
import { NotificationRabbitMQSubscriber } from 'application/rabbitMQ/notification-rabbitMQ.subscriber';
import { HelmetMiddleware } from 'core/middlewares/helmet.middleware';
import { appConfig } from 'core/configs/app.config';
import { GlobalErrorHandlerMiddleware } from 'core/middlewares/error-handler.middleware';
import { RateLimitMiddleware } from 'core/middlewares/rate-limit.middleware';
import Invoice from 'domain/entities/invoice.entity';
import Order from 'domain/entities/order.entity';
import Role from 'domain/entities/role.entity';
import User from 'domain/entities/user.entity';
import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { OrderRepository } from 'domain/repositories/order.repository';
import { RoleRepository } from 'domain/repositories/role.repository';
import { UserRepository } from 'domain/repositories/user.repository';
import { RegisterServiceOptions } from 'domain/interfaces/utility-functions-options.interface';
import { DbConnectionInfrastructure } from 'infrastructure/database/db-connection.infrastructure';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';
import { DataLoaderInfrastructure } from 'infrastructure/database/data-loader.infrastructure';
import { ContainerKeys } from 'application/ioc/static/container-keys';
import { ClusterInfrastructure } from 'infrastructure/cluster/cluster.infrastructure';
import { WorkerThreadsInfrastructure } from 'infrastructure/workers/worker-threads.infrastructure';
import { ExpressServerInfrastructure } from 'infrastructure/server/express-server.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export class ServerBootstrapper {
  private static repositories = [
    { repository: InvoiceRepository, entity: Invoice },
    { repository: OrderRepository, entity: Order },
    { repository: RoleRepository, entity: Role },
    { repository: UserRepository, entity: User }
  ];

  private static dataLoaders = [
    { containerKey: ContainerKeys.INVOICE_DATA_LOADER.toString(), entity: Invoice },
    { containerKey: ContainerKeys.ORDER_DATA_LOADER.toString(), entity: Order },
    { containerKey: ContainerKeys.ROLE_DATA_LOADER.toString(), entity: Role },
    { containerKey: ContainerKeys.USER_DATA_LOADER, entity: User }
  ];

  private static services = [
    { id: ContainerItems.IHealthcheckService, service: HealthcheckService } as RegisterServiceOptions<HealthcheckService>,
    { id: ContainerItems.IAuthService, service: AuthService } as RegisterServiceOptions<AuthService>,
    { id: ContainerItems.IRoleService, service: RoleService } as RegisterServiceOptions<RoleService>,
    { id: ContainerItems.IUserService, service: UserService } as RegisterServiceOptions<UserService>,
    { id: ContainerItems.IOrderService, service: OrderService } as RegisterServiceOptions<OrderService>,
    { id: ContainerItems.IOrderRabbitMQSubscriber, service: OrderRabbitMQSubscriber } as RegisterServiceOptions<OrderRabbitMQSubscriber>,
    { id: ContainerItems.IInvoiceService, service: InvoiceService } as RegisterServiceOptions<InvoiceService>,
    { id: ContainerItems.IInvoiceRabbitMQSubscriber, service: InvoiceRabbitMQSubscriber } as RegisterServiceOptions<InvoiceRabbitMQSubscriber>,
    { id: ContainerItems.INotificationService, service: NotificationService } as RegisterServiceOptions<NotificationService>,
    { id: ContainerItems.INotificationRabbitMQSubscriber, service: NotificationRabbitMQSubscriber } as RegisterServiceOptions<NotificationRabbitMQSubscriber>
  ];

  private static controllers = [
    AuthController as Constructable<AuthController>,
    RolesController as Constructable<RolesController>,
    UsersController as Constructable<UsersController>,
    HealthcheckController as Constructable<HealthcheckController>,
    InvoicesController as Constructable<InvoicesController>,
    OrdersController as Constructable<OrdersController>
  ];

  private static serviceKeys = [
    ContainerItems.IOrderRabbitMQSubscriber,
    ContainerItems.IOrderService,
    ContainerItems.IInvoiceRabbitMQSubscriber,
    ContainerItems.IInvoiceService,
    ContainerItems.INotificationRabbitMQSubscriber,
    ContainerItems.INotificationService
  ];

  private static configureContainers () {
    typeormUseContainer(Container);
    routingControllersUseContainer(Container);
  }

  private static async configureInfrastructure (): Promise<void> {
    const rabbitMQ = new RabbitMQInfrastructure();
    await rabbitMQ.initialize();

    const redis = new RedisInfrastructure();
    await redis.initialize();

    const dbConnection = new DbConnectionInfrastructure();
    const dataSource = await dbConnection.create();
    await dataSource.initialize();

    Container.set(RabbitMQInfrastructure, rabbitMQ);
    Container.set(RedisInfrastructure, redis);
    Container.set(DbConnectionInfrastructure, dbConnection);

    this.dataLoaders.forEach(({ containerKey, entity }) => {
      Container.set(containerKey, new DataLoaderInfrastructure(dataSource.getRepository(entity)));
    });
  }

  private static configureLifecycleServices () {
    Container.set(RateLimitMiddleware, new RateLimitMiddleware());
    Container.set(HelmetMiddleware, new HelmetMiddleware());
    Container.set(GlobalErrorHandlerMiddleware, new GlobalErrorHandlerMiddleware());
    Container.set(ClusterInfrastructure, new ClusterInfrastructure());
    Container.set(WorkerThreadsInfrastructure, new WorkerThreadsInfrastructure());
    Container.set(GracefulShutdownHelper, new GracefulShutdownHelper());
    Container.set(ExpressServerInfrastructure, new ExpressServerInfrastructure());
    Container.set(NotificationService, new NotificationService());
  }

  private static configureControllersAndServices () {
    this.services.forEach(({ id, service }) => registerService({ id, service: service as Constructable<unknown> }));

    const dbConnection = Container.get<DbConnectionInfrastructure>(DbConnectionInfrastructure);
    const dataSource = dbConnection.getDataSource();

    if (!dataSource) {
      throw new Error('Database connection is not initialized.');
    }

    this.repositories.forEach(({ repository, entity }) => Container.set(repository, dataSource.getRepository(entity)));
    this.controllers.forEach((controller) => ContainerHelper.registerController(controller as Constructable<unknown>));
  }

  private static async configureRabbitMQSubscribers () {
    for (const key of this.serviceKeys) {
      const service = ContainerHelper.get<{ initialize?:() => Promise<void> }>(key);

      if (service?.initialize) {
        await service.initialize();
      }
    }
  }

  static async initializeDependencies () {
    this.configureContainers();
    await this.configureInfrastructure();
    this.configureLifecycleServices();
    this.configureControllersAndServices();
    await this.configureRabbitMQSubscribers();
  }

  private static async initializeServer () {
    const appServer = Container.get(ExpressServerInfrastructure);

    const app = await appServer.get();
    const server = http.createServer(app);

    server.keepAliveTimeout = appConfig.KEEP_ALIVE_TIMEOUT;
    server.headersTimeout = appConfig.HEADERS_TIMEOUT;

    return server;
  }

  private static startServer (httpServer: http.Server, port: number) {
    httpServer.listen(port, () => LoggerTracerInfrastructure.log(`Server running on port ${port}`, 'info'));
    httpServer.timeout = appConfig.SERVER_TIMEOUT;
  }

  static async start () {
    try {
      await this.initializeDependencies();

      const clusterInfrastructure = Container.get(ClusterInfrastructure);
      clusterInfrastructure.initialize();

      if (!cluster.isPrimary) {
        const appServer = await this.initializeServer();
        const gracefulShutdownHelper = Container.get(GracefulShutdownHelper);

        handleProcessSignals({ shutdownCallback: gracefulShutdownHelper.shutDown.bind(gracefulShutdownHelper), callbackArgs: [appServer] });
        this.startServer(appServer, appConfig.PORT);
      }
    } catch (error) {
      LoggerTracerInfrastructure.log(`Error during initialization: ${getErrorMessage(error)}`, 'error');
      process.exit(1);
    }
  }
}

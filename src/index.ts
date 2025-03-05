import 'reflect-metadata';
import cluster from 'cluster';
import { Container } from 'typedi';
import http from 'http';

import { ClusterShutdownHelper } from 'application/helpers/cluster-shutdown.helper';
import { handleProcessSignals } from 'application/helpers/utility-functions.helper';
import { configureRepositories, configureControllersAndServices, configureContainers, configureInfrastructures, configureMiddlewares } from 'application/ioc/bindings';
import config from 'core/configs/app.config';
import { initializeSubscribers } from 'domain/event-handlers';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { ClusterInfrastructure } from 'infrastructure/cluster.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ExpressServerInfrastructure } from 'infrastructure/express-server.infrastructure';

const initializeDependencyInjections = async (): Promise<void> => {
  configureContainers();
  configureInfrastructures();
  await configureRepositories();
  configureMiddlewares();
  configureControllersAndServices();
};

const initializeInfrastructureServices = async (): Promise<void> => {
  await RedisInfrastructure.initialize();
  await RabbitMQInfrastructure.initialize();
  await initializeSubscribers();
};

const initializeServer = async (): Promise<http.Server> => {
  const app = await Container.get(ExpressServerInfrastructure).get();
  const server = http.createServer(app);

  server.keepAliveTimeout = config.KEEP_ALIVE_TIMEOUT;
  server.headersTimeout = config.HEADERS_TIMEOUT;

  return server;
};

const startServer = (httpServer: http.Server, port: number): void => {
  httpServer.listen(port, () => LoggerTracerInfrastructure.log(`Server running on port ${port}`, 'info'));
  httpServer.timeout = config.SERVER_TIMEOUT;
};

const main = async (): Promise<void> => {
  try {
    ClusterInfrastructure.initialize();

    if (!cluster.isPrimary) {
      await initializeDependencyInjections();
      await initializeInfrastructureServices();

      const appServer = await initializeServer();

      startServer(appServer, config.PORT);

      handleProcessSignals({ shutdownCallback: ClusterShutdownHelper.shutDown.bind(ClusterShutdownHelper), callbackArgs: [appServer] });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

    LoggerTracerInfrastructure.log(`Error during initialization: ${errorMessage}`, 'error');
    process.exit(1);
  }
};

process.on('uncaughtException', () => {
  LoggerTracerInfrastructure.log('Uncaught exception, exiting process', 'error');
  process.exit(1);
});

process.on('unhandledRejection', () => {
  LoggerTracerInfrastructure.log('Unhandled rejection, exiting process', 'error');
  process.exit(1);
});

main();

import 'reflect-metadata';
import { config } from 'dotenv';
import cluster from 'cluster';
import { Container } from 'typedi';
import http from 'http';

import { configureRepositories, configureControllersAndServices, configureContainers, configureInfrastructures, configureMiddlewares } from 'ioc/bindings';
import { ClusterShutdownHelper } from 'helpers/cluster-shutdown.helper';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { ClusterInfrastructure } from 'infrastructure/cluster.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { initializeSubscribers } from 'event-handlers';
import { handleProcessSignals } from 'helpers/utility-functions.helper';
import { ExpressServerInfrastructure } from 'infrastructure/express-server.infrastructure';

config();

const initializeDependencyInjections = async (): Promise<void> => {
  configureContainers();
  await configureRepositories();
  configureInfrastructures();
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
  return http.createServer(app);
};

const startServer = (httpServer: http.Server, port: number): void => {
  httpServer.listen(port, () => LoggerTracerInfrastructure.log(`Server running on port ${port}`, 'info'));
  httpServer.timeout = parseInt(process.env.SERVER_TIMEOUT!);
};

const main = async (): Promise<void> => {
  try {
    await initializeDependencyInjections();
    await initializeInfrastructureServices();

    ClusterInfrastructure.initialize();

    const appServer = await initializeServer();
    const port = Number(process.env.PORT);

    if (!cluster.isPrimary) {
      startServer(appServer, port);
    }

    handleProcessSignals(ClusterShutdownHelper.shutDown.bind(ClusterShutdownHelper), appServer);
  } catch (err: any) {
    LoggerTracerInfrastructure.log(`Error during initialization: ${err?.message || 'Unknown error occurred'}`, 'error');
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

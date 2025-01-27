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
import { LoggerHelper } from 'helpers/logger.helper';
import { initializeSubscribers } from 'event-handlers';
import { handleProcessSignals } from 'helpers/utility-functions.helper';
import { ExpressServerInfrastructure } from 'infrastructure/express-server.infrastructure';

config();

const initializeInfrastructures = async (): Promise<void> => {
  configureContainers();
  await configureRepositories();
  configureInfrastructures();
  configureMiddlewares();
  configureControllersAndServices();

  ClusterInfrastructure.initialize();

  await RedisInfrastructure.initialize();
  await RabbitMQInfrastructure.initialize();
  await initializeSubscribers();
};

const main = async (): Promise<void> => {
  try {
    await initializeInfrastructures();

    const app = await Container.get(ExpressServerInfrastructure).get();
    const httpServer = http.createServer(app);
    const port = parseInt(process.env.PORT || '3000');

    if (!cluster.isPrimary) {
      httpServer.listen(port, () => LoggerHelper.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`, 'info'));
      httpServer.timeout = parseInt(process.env.SERVER_TIMEOUT!);
    }

    handleProcessSignals(ClusterShutdownHelper.shutDown.bind(ClusterShutdownHelper), httpServer);
  } catch (err: any) {
    LoggerHelper.log(`Error during initialization: ${err?.message || 'Unknown error occurred'}`, 'error');
    process.exit(1);
  }
};

process.on('uncaughtException', () => {
  LoggerHelper.log('Uncaught exception, exiting process', 'error');
  process.exit(1);
});

process.on('unhandledRejection', () => {
  LoggerHelper.log('Unhandled rejection, exiting process', 'error');
  process.exit(1);
});

main();

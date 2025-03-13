import 'reflect-metadata';
import { Container } from 'typedi';
import cluster from 'cluster';
import http from 'http';

import { GracefulShutdownHelper } from 'application/helpers/graceful-shutdown.helper';
import { getErrorMessage, handleProcessSignals } from 'application/helpers/utility-functions.helper';
import { configureLifecycleServices, configureControllersAndServices, configureContainers, configureInfrastructures } from 'application/ioc/bindings';
import config from 'core/configs/app.config';
import { initializeSubscribers } from 'domain/event-handlers';
import { ClusterInfrastructure } from 'infrastructure/cluster/cluster.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';
import { ExpressServerInfrastructure } from 'infrastructure/server/express-server.infrastructure';

const initializeDependencyInjections = async (): Promise<void> => {
  configureContainers();
  await configureInfrastructures();
  configureLifecycleServices();
  configureControllersAndServices();
  await initializeSubscribers();
};

const initializeServer = async (): Promise<http.Server> => {
  const appServer = Container.get(ExpressServerInfrastructure);
  const app = await appServer.get();
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
    await initializeDependencyInjections();

    const clusterInfrastructure = Container.get(ClusterInfrastructure);
    clusterInfrastructure.initialize();

    if (!cluster.isPrimary) {
      const appServer = await initializeServer();
      const gracefulShutdownHelper = Container.get(GracefulShutdownHelper);

      handleProcessSignals({ shutdownCallback: gracefulShutdownHelper.shutDown.bind(gracefulShutdownHelper), callbackArgs: [appServer] });
      startServer(appServer, config.PORT);
    }
  } catch (error) {
    LoggerTracerInfrastructure.log(`Error during initialization: ${getErrorMessage(error)}`, 'error');
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  LoggerTracerInfrastructure.log(`Uncaught exception: ${getErrorMessage(error)}`, 'error');

  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  LoggerTracerInfrastructure.log(`Unhandled rejection: ${getErrorMessage(reason)}`, 'error');

  process.exit(1);
});

main();

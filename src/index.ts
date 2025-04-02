import 'reflect-metadata';

import { getErrorMessage } from 'application/helpers/utility-functions.helper';
import { ServerBootstrapper } from 'application/ioc/bindings';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

process.on('uncaughtException', (error) => {
  LoggerTracerInfrastructure.log(`Uncaught exception: ${getErrorMessage(error)}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  LoggerTracerInfrastructure.log(`Unhandled rejection: ${getErrorMessage(reason)}`, 'error');
  process.exit(1);
});

ServerBootstrapper.start();

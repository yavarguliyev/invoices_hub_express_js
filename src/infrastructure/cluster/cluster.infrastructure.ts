import cluster from 'cluster';

import { getErrorMessage } from 'application/helpers/utility-functions.helper';
import { appConfig } from 'core/configs/app.config';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export class ClusterInfrastructure {
  private initialized: boolean = false;

  initialize (): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      if (cluster.isPrimary) {
        this.setupPrimaryProcess();
      }
    } catch (error) {
      LoggerTracerInfrastructure.log(`Cluster initialization error: ${getErrorMessage(error)}`, 'error');
      process.exit(1);
    }
  }

  private setupPrimaryProcess (): void {
    const numCPUs = appConfig.CLUSTER_WORKERS;
    this.forkWorkers(numCPUs);
  }

  private forkWorkers (numCPUs: number): void {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0 || signal) {
        LoggerTracerInfrastructure.log(`Worker ${worker.process.pid} exited (code: ${code}, signal: ${signal}). Restarting...`, 'error');
        cluster.fork();
      }
    });
  }
}

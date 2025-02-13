import cluster from 'cluster';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ClusterShutdownHelper } from 'application/helpers/cluster-shutdown.helper';
import { handleProcessSignals } from 'application/helpers/utility-functions.helper';
import { WorkerThreadsInfrastructure } from 'infrastructure/worker-threads.infrastructure';

export class ClusterInfrastructure {
  static initialized = false;

  static initialize (): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      if (cluster.isPrimary) {
        this.setupPrimaryProcess();
      } else {
        WorkerThreadsInfrastructure.executeHeavyTask();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      LoggerTracerInfrastructure.log(`Cluster initialization error: ${errorMessage}`, 'error');
      process.exit(1);
    }
  }

  private static setupPrimaryProcess (): void {
    const numCPUs = Number(process.env.CLUSTER_WORKERS);
    this.forkWorkers(numCPUs);
    handleProcessSignals({ shutdownCallback: ClusterShutdownHelper.shutdownWorkers, callbackArgs: [] });
  }

  private static forkWorkers (numCPUs: number): void {
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

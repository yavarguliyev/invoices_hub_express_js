import cluster from 'cluster';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ClusterShutdownHelper } from 'helpers/cluster-shutdown.helper';
import { handleProcessSignals } from 'helpers/utility-functions.helper';
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
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Cluster initialization error: ${err.message}`, 'error');
      process.exit(1);
    }
  }

  private static setupPrimaryProcess (): void {
    const numCPUs = Number(process.env.CLUSTER_WORKERS);
    this.forkWorkers(numCPUs);
    handleProcessSignals(ClusterShutdownHelper.shutdownWorkers);
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

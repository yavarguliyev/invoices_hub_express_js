import cluster from 'cluster';
import { Worker } from 'worker_threads';
import path from 'path';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ClusterShutdownHelper } from 'helpers/cluster-shutdown.helper';
import { handleProcessSignals } from 'helpers/utility-functions.helper';
import { WorkerThreadsOperations } from 'common/enums/worker-threads-operations.enum';

export class ClusterInfrastructure {
  static initialized = false;

  static initialize (): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      this.validateEnvVars();
      const numCPUs = Number(process.env.CLUSTER_WORKERS);

      if (cluster.isPrimary) {
        this.forkWorkers(numCPUs);
        handleProcessSignals(ClusterShutdownHelper.shutDownWorkers);
      } else {
        this.spawnWorkerThread();
      }
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Cluster initialization error: ${err.message}`, 'error');
      process.exit(1);
    }
  }

  private static validateEnvVars (): void {
    const requiredEnvVars = ['CLUSTER_WORKERS', 'HEAVY_COMPUTATION_TOTAL'];

    requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        LoggerTracerInfrastructure.log(`Missing required env variable: ${varName}`, 'error');
        process.exit(1);
      }
    });
  }

  private static forkWorkers (numCPUs: number): void {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      if (code !== 0 || signal) {
        LoggerTracerInfrastructure.log(`Worker ${worker.process.pid} crashed. Restarting... Code: ${code}, Signal: ${signal}`, 'error');
        cluster.fork();
      }
    });
  }

  private static spawnWorkerThread (): void {
    const workerPath = path.resolve(__dirname, process.env.WORKER_FILE_DIRECTION);
    const worker = new Worker(workerPath);

    worker.on('message', (message) => {
      if (!message.success) {
        LoggerTracerInfrastructure.log(`Worker Thread Error: ${message.error || 'Unknown error occurred'}`, 'error');
      }
    });

    worker.on('error', (error) => {
      LoggerTracerInfrastructure.log(`Worker thread encountered an error: ${error}`, 'error');
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        LoggerTracerInfrastructure.log(`Worker thread exited with code: ${code}`, 'error');
      }
    });

    worker.postMessage({ name: WorkerThreadsOperations.HEAVY_COMPUTATION, params: { total: Number(process.env.HEAVY_COMPUTATION_TOTAL) } });
  }
}

import cluster from 'cluster';
import os from 'os';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ClusterShutdownHelper } from 'helpers/cluster-shutdown.helper';
import { handleProcessSignals } from 'helpers/utility-functions.helper';

export class ClusterInfrastructure {
  static initialized = false;

  static initialize () {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    try {
      if (cluster.isPrimary) {
        const numCPUs = os.cpus().length;

        for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
        }

        cluster.on('exit', () => cluster.fork());

        handleProcessSignals(ClusterShutdownHelper.shutDownWorkers);
      } else {
        LoggerTracerInfrastructure.log(`Worker process running: ${process.pid}`, 'info');
      }
    } catch (err: any) {
      process.exit(1);
    }
  }
}

import http from 'http';
import cluster from 'cluster';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';

export class ClusterShutdownHelper {
  static shutdownTimeout = Number(process.env.SHUT_DOWN_TIMER);

  static async shutDown (httpServer: http.Server): Promise<void> {
    let shutdownTimer;

    try {
      if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
      }

      await this.disconnectServices();

      if (cluster.isPrimary) {
        await this.shutDownWorkerThreads();
        await this.shutDownWorkers();
      }

      shutdownTimer = this.startShutdownTimer();
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Error during shutdown: ${err?.message || 'Unknown error occurred'}`, 'error');
    } finally {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }

      process.exit(0);
    }
  }

  static async shutDownWorkers (): Promise<void> {
    const workers = Object.values(cluster.workers || {});

    for (const worker of workers) {
      try {
        worker?.kill('SIGINT');
      } catch (err) {
        LoggerTracerInfrastructure.log(`Error while shutting down worker: ${err}`, 'error');
      }
    }
  }

  static async shutDownWorkerThreads (): Promise<void> {
    const workers = Object.values(cluster.workers || {});

    for (const worker of workers) {
      if (worker) {
        worker.send({ action: 'shutdown' });
        worker.on('exit', (code) => LoggerTracerInfrastructure.log(`Worker thread exited with code: ${code}`, 'info'));
      }
    }
  }

  private static async disconnectServices (): Promise<void> {
    const services = [
      this.disconnectWithRetry(RedisInfrastructure.disconnect),
      this.disconnectWithRetry(RabbitMQInfrastructure.disconnect),
      this.disconnectWithRetry(DbConnectionInfrastructure.disconnect)
    ];

    await Promise.all(services.map(p => p.catch(err => LoggerTracerInfrastructure.log(`Service shutdown error: ${err}`, 'error'))));
  }

  private static async disconnectWithRetry (disconnectFn: Function, retries = 3, delay = 1000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await disconnectFn();
        return;
      } catch (err) {
        if (attempt === retries) {
          throw err;
        }

        LoggerTracerInfrastructure.log(`Error during service shutdown, retrying... Attempt ${attempt}`, 'error');
        await this.delay(delay);
      }
    }
  }

  private static delay (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static startShutdownTimer () {
    return setTimeout(() => {
      LoggerTracerInfrastructure.log('Shutdown timeout reached, forcing process exit', 'error');
      process.exit(1);
    }, this.shutdownTimeout);
  }
}

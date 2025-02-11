import { Worker } from 'worker_threads';
import path from 'path';
import { config } from 'dotenv';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { WorkerThreadsOperations } from 'common/enums/worker-threads-operations.enum';
import { WorkerThreadsTask } from 'common/types/worker-threads-task.type';

config();

export class WorkerThreadsInfrastructure {
  static workerPool: Worker[] = [];
  private static numThreads = Number(process.env.THREAD_WORKERS);
  private static totalTasks = Number(process.env.HEAVY_COMPUTATION_TOTAL);
  private static workerFile = path.resolve(__dirname, process.env.WORKER_FILE_DIRECTION);

  static createWorker (): Worker {
    const worker = new Worker(this.workerFile);
    this.workerPool.push(worker);
    return worker;
  }

  private static async spawnWorkerThread (task: WorkerThreadsTask): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.workerPool.pop() || this.createWorker();

      worker.once('message', (message) => {
        message.success ? resolve(message.result) : reject(new Error(message.error || 'Unknown error occurred'));
        this.workerPool.push(worker);
      });

      worker.once('error', (error) => {
        LoggerTracerInfrastructure.log(`Worker thread error: ${error}`, 'error');
        reject(error);
        worker.terminate();
      });

      worker.postMessage(task);
    });
  }

  static async executeHeavyTask (): Promise<any> {
    const total = Math.ceil(this.totalTasks / this.numThreads);
    const tasks = Array.from({ length: this.numThreads }).map(() =>
      this.spawnWorkerThread({ name: WorkerThreadsOperations.HEAVY_COMPUTATION, params: { total } })
    );

    return Promise.all(tasks);
  }

  static shutdownWorkers (): void {
    LoggerTracerInfrastructure.log('Shutting down all worker threads...', 'info');
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];
  }
}

import { Worker } from 'worker_threads';
import path from 'path';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { WorkerThreadsTask } from 'core/types/worker-threads-task.type';
import appConfig from 'core/configs/app.config';

export class WorkerThreadsInfrastructure {
  private static workerPool: Worker[] = [];
  private static taskQueue: { task: WorkerThreadsTask; resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];
  private static numThreads = appConfig.MAX_WORKERS;
  private static workerFile = path.resolve(__dirname, appConfig.WORKER_FILE_DIRECTION);

  private static createWorker (): Worker {
    const worker = new Worker(this.workerFile);

    worker.on('message', (message: { success: boolean; result?: unknown; error?: string }) => {
      const task = this.taskQueue.shift();
      if (task) {
        message.success ? task.resolve(message.result) : task.reject(new Error(message.error || 'Unknown error occurred'));
      }
      this.workerPool.push(worker);
      this.processQueue();
    });

    worker.on('error', (error: Error) => {
      LoggerTracerInfrastructure.log(`Worker thread error: ${error}`, 'error');
      const task = this.taskQueue.shift();
      if (task) {
        task.reject(error);
      }
      worker.terminate();
    });

    return worker;
  }

  private static processQueue () {
    if (this.taskQueue.length > 0 && this.workerPool.length > 0) {
      const worker = this.workerPool.pop();

      if (worker) {
        const { task } = this.taskQueue[0];
        worker.postMessage(task);
      }
    }
  }

  static async executeHeavyTask (task: WorkerThreadsTask) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });

      if (this.workerPool.length < this.numThreads && this.workerPool.length < this.taskQueue.length) {
        this.workerPool.push(this.createWorker());
      }

      this.processQueue();
    });
  }

  static shutdownWorkers () {
    LoggerTracerInfrastructure.log('Shutting down all worker threads...', 'info');
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];
    this.taskQueue = [];
  }
}

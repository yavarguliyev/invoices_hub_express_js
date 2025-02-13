import { parentPort } from 'worker_threads';

import { TaskParams, WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';
import { WorkerThreadsTask } from 'core/types/worker-threads-task.type';

class WorkersInfrastructureTaskHandler {
  private static taskExecutors: {
    [WorkerThreadsOperations.HEAVY_COMPUTATION]: (params: TaskParams[WorkerThreadsOperations.HEAVY_COMPUTATION]) => number;
    [WorkerThreadsOperations.DATA_TRANSFORMATION]: (params: TaskParams[WorkerThreadsOperations.DATA_TRANSFORMATION]) => string;
  } = {
      [WorkerThreadsOperations.HEAVY_COMPUTATION]: WorkersInfrastructureTaskHandler.heavyComputation,
      [WorkerThreadsOperations.DATA_TRANSFORMATION]: WorkersInfrastructureTaskHandler.dataTransformation
    };

  static async execute<T extends WorkerThreadsOperations> (task: WorkerThreadsTask<T>) {
    const executeTask = this.taskExecutors[task.name];
    if (!executeTask) {
      throw new Error(`Unknown task: ${task.name}`);
    }

    if ('total' in task.params) {
      return executeTask({ total: task.params.total });
    }

    if ('data' in task.params) {
      return executeTask({ data: task.params.data });
    }

    throw new Error(`Task ${task.name} not handled correctly`);
  }

  private static heavyComputation (params: TaskParams[WorkerThreadsOperations.HEAVY_COMPUTATION]) {
    const total = params?.total ?? Number(process.env.HEAVY_COMPUTATION_TOTAL);

    return !Number.isFinite(total) ? 0 : total;
  }

  private static dataTransformation (params: TaskParams[WorkerThreadsOperations.DATA_TRANSFORMATION]) {
    return JSON.stringify(params.data).toUpperCase();
  }
}

parentPort?.on('message', async <T extends WorkerThreadsOperations>(task: WorkerThreadsTask<T>) => {
  if (task.action === 'shutdown') {
    process.exit(0);
  }

  try {
    const result = await WorkersInfrastructureTaskHandler.execute(task);
    parentPort?.postMessage({ success: true, result });
  } catch (error) {
    parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

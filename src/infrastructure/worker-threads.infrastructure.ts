import { parentPort } from 'worker_threads';

import { WorkerThreadsTask } from 'common/types/worker-threads-task.type';
import { WorkerThreadsOperations } from 'common/enums/worker-threads-operations.enum';

class TaskHandler {
  static async execute (task: WorkerThreadsTask): Promise<any> {
    switch (task.name) {
      case WorkerThreadsOperations.HEAVY_COMPUTATION:
        return TaskHandler.heavyComputation(task.params);
      default:
        throw new Error(`Unknown task: ${task.name}`);
    }
  }

  private static heavyComputation (params: any): number {
    const total = params?.total ?? Number(process.env.HEAVY_COMPUTATION_TOTAL);

    return (total * (total - 1)) / 2;
  }
}

parentPort?.on('message', async (task: WorkerThreadsTask) => {
  try {
    const result = await TaskHandler.execute(task);
    parentPort?.postMessage({ success: true, result });
  } catch (error) {
    parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

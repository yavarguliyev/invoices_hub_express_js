import { parentPort } from 'worker_threads';

import { WorkerThreadsTask } from 'core/types/worker-threads-task.type';
import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';

class WorkersInfrastructureTaskHandler {
  private static taskExecutors: Record<WorkerThreadsOperations, (params: any) => any> = {
    [WorkerThreadsOperations.HEAVY_COMPUTATION]: WorkersInfrastructureTaskHandler.heavyComputation,
    [WorkerThreadsOperations.DATA_TRANSFORMATION]: WorkersInfrastructureTaskHandler.dataTransformation
  };

  static async execute (task: WorkerThreadsTask): Promise<any> {
    const executeTask = this.taskExecutors[task.name];
    if (!executeTask) {
      throw new Error(`Unknown task: ${task.name}`);
    }

    return executeTask(task.params);
  }

  private static heavyComputation (params: any): number {
    const total = WorkersInfrastructureTaskHandler.getTotal(params);
    return (total * (total - 1)) / 2;
  }

  private static getTotal (params: any): number {
    const total = params?.total ?? Number(process.env.HEAVY_COMPUTATION_TOTAL);

    if (!Number.isFinite(total)) {
      throw new Error(`Invalid "total" value: ${total} is not a valid number.`);
    }

    return total;
  }

  private static dataTransformation (params: any): string {
    return JSON.stringify(params).toUpperCase();
  }
}

parentPort?.on('message', async (task: WorkerThreadsTask) => {
  if (task.action === 'shutdown') {
    process.exit(0);
  }

  try {
    const result = await WorkersInfrastructureTaskHandler.execute(task as WorkerThreadsTask);
    parentPort?.postMessage({ success: true, result });
  } catch (error) {
    parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

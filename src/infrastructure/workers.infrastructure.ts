import { parentPort } from 'worker_threads';

import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';
import { Payload } from 'core/types/worker-threads-operations.type';
import { Task } from 'domain/interfaces/worker-threads-operations.interface';

class GenericTask<P extends object, R extends Payload> implements Task<P, R> {
  private readonly operation: string;
  private readonly processor: (payload: P) => R;

  constructor (operation: string, processor: (payload: P) => R) {
    this.operation = operation;
    this.processor = processor;
  }

  execute (payload: P): R {
    return this.processor(payload);
  }
}

class WorkerTaskHandler {
  private static taskExecutors: { [key in WorkerThreadsOperations]?: Task<object, Payload>; } = {};

  static registerTask<T extends WorkerThreadsOperations, P extends object> (taskName: T, processor: (payload: P) => Payload) {
    WorkerTaskHandler.taskExecutors[taskName] = new GenericTask<P, Payload>(taskName, processor);
  }

  static executeTask<T extends WorkerThreadsOperations> (taskName: T, param: object) {
    const task = WorkerTaskHandler.taskExecutors[taskName];
    if (!task) {
      throw new Error(`Unknown task: ${taskName}`);
    }

    return task.execute(param);
  }
}

WorkerTaskHandler.registerTask(WorkerThreadsOperations.HEAVY_COMPUTATION, (payload: { iterations: number }) => {
  let result = 0;
  if (typeof payload.iterations !== 'number') {
    return { message: WorkerThreadsOperations.HEAVY_COMPUTATION, data: { iterations: 0 } };
  }

  for (let i = 0; i < payload.iterations; i++) {
    result += Math.sqrt(i);
  }

  return { message: WorkerThreadsOperations.HEAVY_COMPUTATION, data: { iterations: result } };
});

WorkerTaskHandler.registerTask(WorkerThreadsOperations.DATA_TRANSFORMATION, (payload: object) => {
  return { message: WorkerThreadsOperations.DATA_TRANSFORMATION, data: payload };
});

parentPort?.on('message', async (message: { name: string; params: object }) => {
  const { name, params } = message;

  if (name === 'shutdown') {
    process.exit(0);
  }

  try {
    const result = WorkerTaskHandler.executeTask(name as WorkerThreadsOperations, params);
    parentPort?.postMessage({ success: true, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
});

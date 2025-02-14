import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';
import { TaskParams } from 'core/types/worker-threads-operations.type';

export type WorkerThreadsTask<T extends WorkerThreadsOperations = WorkerThreadsOperations> = {
  name: T;
  params: TaskParams[T];
};

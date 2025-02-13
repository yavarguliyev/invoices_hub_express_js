import { TaskParams, WorkerThreadsAction, WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';

export type WorkerThreadsTask<T extends WorkerThreadsOperations = WorkerThreadsOperations> = {
  name: T;
  params: TaskParams[T];
  action?: WorkerThreadsAction;
};

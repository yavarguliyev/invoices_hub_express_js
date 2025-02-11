import { WorkerThreadsAction, WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';

export type WorkerThreadsTask = { name: WorkerThreadsOperations; params: any; action?: WorkerThreadsAction };

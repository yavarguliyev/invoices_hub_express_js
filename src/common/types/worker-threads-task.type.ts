import { WorkerThreadsAction, WorkerThreadsOperations } from 'common/enums/worker-threads-operations.enum';

export type WorkerThreadsTask = { name: WorkerThreadsOperations; params: any; action?: WorkerThreadsAction };

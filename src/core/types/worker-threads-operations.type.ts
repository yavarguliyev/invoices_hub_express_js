import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';

export type TaskParams = {
  [WorkerThreadsOperations.HEAVY_COMPUTATION]: { iterations: number } | { [key: string]: boolean };
  [WorkerThreadsOperations.DATA_TRANSFORMATION]: <T>(payload: T) => { message: string; data: T };
};

export type Payload = { message: string; data: object };

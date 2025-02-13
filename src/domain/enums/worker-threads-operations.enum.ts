export enum WorkerThreadsOperations { HEAVY_COMPUTATION = 'heavyComputation', DATA_TRANSFORMATION = 'dataTransformation' };
export type WorkerThreadsAction = 'shutdown' | 'shutdown-complete';
export type TaskParams = {
  [WorkerThreadsOperations.HEAVY_COMPUTATION]: { total?: number };
  [WorkerThreadsOperations.DATA_TRANSFORMATION]: { data?: string };
};

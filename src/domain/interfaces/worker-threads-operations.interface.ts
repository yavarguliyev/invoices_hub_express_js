export interface Task<P extends object, R> {
  execute(payload: P): R;
}

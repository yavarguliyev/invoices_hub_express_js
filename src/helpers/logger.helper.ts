export class LoggerHelper {
  static log (message: string, level: 'info' | 'error' = 'info') {
    console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`);
  }
}

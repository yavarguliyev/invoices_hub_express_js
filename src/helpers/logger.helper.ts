import { winstonLogger } from 'helpers/utility-functions.helper';

export class LoggerHelper {
  static log (message: string, level: 'info' | 'error' = 'info') {
    const msg = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;

    if (level === 'error') {
      winstonLogger.error(msg);
    } else {
      winstonLogger.info(msg);
    }
  }
}

import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  KEEP_ALIVE_TIMEOUT: Number(process.env.KEEP_ALIVE_TIMEOUT),
  HEADERS_TIMEOUT: Number(process.env.HEADERS_TIMEOUT),
  SERVER_TIMEOUT: Number(process.env.SERVER_TIMEOUT),
  SHUT_DOWN_TIMER: Number(process.env.SHUT_DOWN_TIMER),
  SHUTDOWN_RETRIES: Number(process.env.SHUTDOWN_RETRIES),
  SHUTDOWN_RETRY_DELAY: Number(process.env.SHUTDOWN_RETRY_DELAY),
  HEAVY_COMPUTATION_TOTAL: Number(process.env.HEAVY_COMPUTATION_TOTAL),
  REDIS_DEFAULT_CACHE_TTL: Number(process.env.REDIS_DEFAULT_CACHE_TTL) || 3600,
  STANDARD_ROLE_ID: Number(process.env.STANDARD_ROLE_ID),
  CLUSTER_WORKERS: Number(process.env.CLUSTER_WORKERS),
  MAX_WORKERS: Number(process.env.MAX_WORKERS),
  WORKER_FILE_DIRECTION: process.env.WORKER_FILE_DIRECTION
};

export { appConfig };

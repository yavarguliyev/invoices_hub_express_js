export type HealthcheckResponse = {
  message: 'OK' | 'FAIL';
  uptime: number;
  timestamp: number;
  workerId: number;
  db: 'healthy' | 'unhealthy';
  redis: 'healthy' | 'unhealthy';
  rabbitMQ: 'healthy' | 'unhealthy';
};

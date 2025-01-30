export type HealthcheckResponse = {
  message: 'OK' | 'FAIL';
  uptime: number;
  timestamp: number;
  redis: 'healthy' | 'unhealthy';
  rabbitMQ: 'healthy' | 'unhealthy';
  db: 'healthy' | 'unhealthy';
};

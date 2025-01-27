import { JsonController, Get, HttpError } from 'routing-controllers';

import { BaseController } from 'controllers/base.controller';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';

@JsonController('/healthcheck')
export class HealthcheckController extends BaseController {
  constructor () {
    super();
  }

  @Get('/')
  async healthcheck () {
    const healthcheckStatus = { message: 'OK', uptime: process.uptime(), timestamp: Date.now(), redis: '' };

    try {
      const isConnected = await RedisInfrastructure.isConnected();
      healthcheckStatus.redis = isConnected ? 'healthy' : 'unhealthy';

      return healthcheckStatus;
    } catch (err: any) {
      throw new HttpError(503, err?.message || 'An unknown error occurred');
    }
  }
}

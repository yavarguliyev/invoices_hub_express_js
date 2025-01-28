import { JsonController, Get } from 'routing-controllers';

import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import { createVersionedRoute } from 'helpers/utility-functions.helper';

@JsonController(createVersionedRoute('/healthcheck', 'v1'))
export class HealthcheckController {
  @Get('/')
  async healthcheck () {
    const healthcheckStatus = { message: 'OK', uptime: process.uptime(), timestamp: Date.now(), redis: 'unhealthy', rabbitMQ: 'unhealthy', db: 'unhealthy' };

    const db = DbConnectionInfrastructure.isConnected();
    const redis = await RedisInfrastructure.isConnected();
    const rabbitMQ = RabbitMQInfrastructure.isConnected();

    healthcheckStatus.db = db ? 'healthy' : 'unhealthy';
    healthcheckStatus.redis = redis ? 'healthy' : 'unhealthy';
    healthcheckStatus.rabbitMQ = rabbitMQ ? 'healthy' : 'unhealthy';

    return healthcheckStatus;
  }
}

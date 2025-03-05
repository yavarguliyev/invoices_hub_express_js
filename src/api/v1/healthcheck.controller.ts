import { JsonController, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { IHealthcheckService } from 'application/services/healthcheck.service';

@JsonController(createVersionedRoute({ controllerPath: '/healthcheck', version: 'v1' }))
export class HealthcheckController {
  private healthCheckService: IHealthcheckService;

  constructor () {
    this.healthCheckService = ContainerHelper.get<IHealthcheckService>(ContainerItems.IHealthcheckService);
  }

  @Get('/')
  @OpenAPI(swaggerSchemas.healthcheck.healthcheck)
  async healthcheck () {
    return await this.healthCheckService.healthcheck();
  }
}

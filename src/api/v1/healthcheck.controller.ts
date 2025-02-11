import { JsonController, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { IHealthcheckService } from 'application/services/healthcheck.service';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';

@JsonController(createVersionedRoute('/healthcheck', 'v1'))
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

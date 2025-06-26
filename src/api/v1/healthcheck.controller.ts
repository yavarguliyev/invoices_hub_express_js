import { JsonController, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { BaseController } from 'api/base.controller';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';

@JsonController(createVersionedRoute({ controllerPath: '/healthcheck', version: 'v1' }))
export class HealthcheckController extends BaseController {
  @Get('/')
  @OpenAPI(swaggerSchemas.healthcheck.healthcheck)
  async healthcheck () {
    return await this.healthCheckService.healthcheck();
  }
}

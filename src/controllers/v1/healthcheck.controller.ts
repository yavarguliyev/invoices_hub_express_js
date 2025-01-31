import { JsonController, Get, Authorized } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IHealthcheckService } from 'services/healthcheck.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { Roles } from 'common/enums/roles.enum';
import { swaggerSchemas } from 'helpers/swagger-schemas.helper';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
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

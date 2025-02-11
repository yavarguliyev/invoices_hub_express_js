import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { IRoleService } from 'application/services/role.service';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { Roles } from 'domain/enums/roles.enum';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute('/roles', 'v1'))
export class RolesController {
  private roleService: IRoleService;

  constructor () {
    this.roleService = ContainerHelper.get<IRoleService>(ContainerItems.IRoleService);
  }

  @Get('/')
  @OpenAPI(swaggerSchemas.roles.getRolesList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.roleService.get(query);
  }
}

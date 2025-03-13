import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { IRoleService } from 'application/services/role.service';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { Roles } from 'domain/enums/roles.enum';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute({ controllerPath: '/roles', version: 'v1' }))
export class RolesController {
  private _roleService: IRoleService;

  private get roleService (): IRoleService {
    if (!this._roleService) {
      this._roleService = ContainerHelper.get<IRoleService>(ContainerItems.IRoleService);
    }

    return this._roleService;
  }

  @Get('/')
  @OpenAPI(swaggerSchemas.roles.getRolesList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.roleService.get(query);
  }
}

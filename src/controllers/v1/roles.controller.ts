import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IRoleService } from 'services/role.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { Roles } from 'value-objects/enums/roles.enum';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute('/roles', 'v1'))
export class RolesController {
  private roleService: IRoleService;

  constructor () {
    this.roleService = ContainerHelper.get<IRoleService>(ContainerItems.IRoleService);
  }

  @Get('/')
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.roleService.get(query);
  }
}

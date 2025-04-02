import { JsonController, Get, Authorized, QueryParams, Params } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { BaseController } from 'api/base-controller';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { GetUserArgs } from 'core/inputs/get-user.args';
import { Roles } from 'domain/enums/roles.enum';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute({ controllerPath: '/users', version: 'v1' }))
export class UsersController extends BaseController {
  @Get('/')
  @OpenAPI(swaggerSchemas.users.getUserList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.userService.get(query);
  }

  @Get('/:id')
  @OpenAPI(swaggerSchemas.users.getUserBy)
  async getBy (@Params() args: GetUserArgs) {
    return await this.userService.getBy(args);
  }
}

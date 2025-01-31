import { JsonController, Get, Post, Put, Delete, Param, Params, Body, HttpCode, Authorized, QueryParams, Patch } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IUserService } from 'services/user.service';
import { GetUserArgs } from 'common/inputs/get-user.args';
import { CreateUserArgs } from 'common/inputs/create-user.args';
import { UpdateUserArgs } from 'common/inputs/update-user.args';
import { DeleteUserArgs } from 'common/inputs/delete-user.args';
import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { Roles } from 'common/enums/roles.enum';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { UpdateUserPasswordArgs } from 'common/inputs/update-user-password.args';
import { swaggerSchemas } from 'helpers/swagger-schemas.helper';

@JsonController(createVersionedRoute('/users', 'v1'))
export class UsersController {
  private userService: IUserService;

  constructor () {
    this.userService = ContainerHelper.get<IUserService>(ContainerItems.IUserService);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Get('/')
  @OpenAPI(swaggerSchemas.users.getUserList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.userService.get(query);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Get('/:id')
  @OpenAPI(swaggerSchemas.users.getUserBy)
  async getBy (@Params() args: GetUserArgs) {
    return await this.userService.getBy(args);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @HttpCode(201)
  @Post('/')
  @OpenAPI(swaggerSchemas.users.createUser)
  async create (@Body() args: CreateUserArgs) {
    return await this.userService.create(args);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Put('/:id')
  @OpenAPI(swaggerSchemas.users.updateUser)
  async update (@Param('id') id: number, @Body() args: UpdateUserArgs) {
    return await this.userService.update(id, args);
  }

  @Authorized([Roles.Standard])
  @Patch('/:id/password')
  @OpenAPI(swaggerSchemas.users.updatePassword)
  async updatePassword (@Param('id') id: number, @Body() args: UpdateUserPasswordArgs) {
    return await this.userService.updatePassword(id, args);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Delete('/:id')
  @OpenAPI(swaggerSchemas.users.deleteUser)
  async delete (@Params() args: DeleteUserArgs) {
    return await this.userService.delete(args);
  }
}

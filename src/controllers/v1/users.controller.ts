import { JsonController, Get, Post, Put, Delete, Param, Params, Body, HttpCode } from 'routing-controllers';

import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IUserService } from 'services/user.service';
import { GetUserArgs } from 'value-objects/inputs/user/get-user.args';
import { CreateUserArgs } from 'value-objects/inputs/user/create-user.args';
import { UpdateUserArgs } from 'value-objects/inputs/user/update-user.args';
import { DeleteUserArgs } from 'value-objects/inputs/user/delete-user.args';
import { createVersionedRoute } from 'helpers/utility-functions.helper';

@JsonController(createVersionedRoute('/users', 'v1'))
export class UsersController {
  private userService: IUserService;

  constructor () {
    this.userService = ContainerHelper.get<IUserService>(ContainerItems.IUserService);
  }

  @Get('/')
  async get () {
    return await this.userService.get();
  }

  @Get('/:id')
  async getBy (@Params() args: GetUserArgs) {
    return await this.userService.getBy(args);
  }

  @HttpCode(201)
  @Post('/')
  async create (@Body() args: CreateUserArgs) {
    return await this.userService.create(args);
  }

  @Put('/:id')
  async update (@Param('id') id: number, @Body() args: UpdateUserArgs) {
    return await this.userService.update(id, args);
  }

  @Delete('/:id')
  async delete (@Params() args: DeleteUserArgs) {
    return await this.userService.delete(args);
  }
}

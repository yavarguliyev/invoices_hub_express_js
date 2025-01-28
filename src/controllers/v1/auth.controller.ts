import { Body, JsonController, Post } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IAuthService } from 'services/auth.service';
import { SigninArgs } from 'value-objects/inputs/auth/signin.args';

@JsonController(createVersionedRoute('/auth', 'v1'))
export class AuthController {
  private authService: IAuthService;

  constructor () {
    this.authService = ContainerHelper.get<IAuthService>(ContainerItems.IAuthService);
  }

  @Post('/signin')
  async signin (@Body() args: SigninArgs) {
    return await this.authService.signin(args);
  }

  @Post('/signout')
  async signout () {
    return await this.authService.signout();
  }
}

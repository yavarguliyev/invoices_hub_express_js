import { Body, HeaderParam, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IAuthService } from 'services/auth.service';
import { SigninArgs } from 'common/inputs/signin.args';
import { swaggerSchemas } from 'helpers/swagger-schemas.helper';

@JsonController(createVersionedRoute('/auth', 'v1'))
export class AuthController {
  private authService: IAuthService;

  constructor () {
    this.authService = ContainerHelper.get<IAuthService>(ContainerItems.IAuthService);
  }

  @Post('/signin')
  @OpenAPI(swaggerSchemas.auth.signin)
  async signin (@Body() args: SigninArgs) {
    return await this.authService.signin(args);
  }

  @Post('/signout')
  @OpenAPI(swaggerSchemas.auth.signout)
  async signout (@HeaderParam('authorization') accesToken: string) {
    return await this.authService.signout(accesToken);
  }
}

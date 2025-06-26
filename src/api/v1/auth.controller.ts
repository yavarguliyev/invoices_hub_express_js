import { Body, HeaderParam, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { BaseController } from 'api/base.controller';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { SigninArgs } from 'core/inputs/signin.args';

@JsonController(createVersionedRoute({ controllerPath: '/auth', version: 'v1' }))
export class AuthController extends BaseController {
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

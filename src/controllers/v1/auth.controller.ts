import { JsonController } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';

@JsonController(createVersionedRoute('/auth', 'v1'))
export class AuthController {}

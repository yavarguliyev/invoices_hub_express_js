import { createExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { Express } from 'express';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import swaggerUi from 'swagger-ui-express';

import { HealthcheckController } from 'controllers/v1/healthcheck.controller';
import { UsersController } from 'controllers/v1/users.controller';
import { ErrorHandlerMiddleware } from 'middlewares/error-handler.middleware';
import { AuthController } from 'controllers/v1/auth.controller';
import { InvoicesController } from 'controllers/v1/invoices.controller';
import { RolesController } from 'controllers/v1/roles.controller';

export interface IExpressServerInfrastructure {
  get(): Promise<Express>;
}

export class ExpressServerInfrastructure implements IExpressServerInfrastructure {
  private server?: Express;

  public constructor () {}

  public async get (): Promise<Express> {
    if (!this.server) {
      this.server = this.createServer();
    }

    return this.server;
  }

  private createServer (): Express {
    const controllers = [AuthController, HealthcheckController, InvoicesController, RolesController, UsersController];

    const app = createExpressServer({
      controllers,
      middlewares: [ErrorHandlerMiddleware],
      defaultErrorHandler: false
    });

    const storage = getMetadataArgsStorage();
    const openAPISpec = routingControllersToSpec(storage);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openAPISpec));

    return app;
  }
}

import { createExpressServer } from 'routing-controllers';
import { Express } from 'express';

import { HealthcheckController } from 'controllers/v1/healthcheck.controller';
import { UsersController } from 'controllers/v1/users.controller';
import { ErrorHandlerMiddleware } from 'middlewares/error-handler.middleware';

export interface IExpressServerInfrastructure {
  get(): Promise<Express>;
}

export class ExpressServerInfrastructure implements IExpressServerInfrastructure {
  private server: Express | null = null;

  public constructor () {}

  public async get (): Promise<Express> {
    if (!this.server) {
      this.server = this.createServer();
    }

    return this.server;
  }

  private createServer (): Express {
    return createExpressServer({
      // cors: { origin: '*' },
      routePrefix: '/api/v1',
      controllers: [HealthcheckController, UsersController],
      middlewares: [ErrorHandlerMiddleware],
      classTransformer: false,
      defaultErrorHandler: false
    });
  }
}

import { createExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { Express } from 'express';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import passport from 'passport';

import { HealthcheckController } from 'controllers/v1/healthcheck.controller';
import { UsersController } from 'controllers/v1/users.controller';
import { ErrorHandlerMiddleware } from 'middlewares/error-handler.middleware';
import { AuthController } from 'controllers/v1/auth.controller';
import { InvoicesController } from 'controllers/v1/invoices.controller';
import { RolesController } from 'controllers/v1/roles.controller';
import { OrdersController } from 'controllers/v1/orders.controller';
import { AuthStrategiesInfrastructure } from 'infrastructure/auth-strategies.infrastructure';
import { authorizationChecker } from 'helpers/authorization-checker.helper';
import { getSchemasList } from 'helpers/swagger-schemas.helper';

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
    const controllers = [
      AuthController, HealthcheckController, OrdersController, InvoicesController, RolesController, UsersController
    ];

    const authStrategies = AuthStrategiesInfrastructure.buildStrategies();
    for (const strategy of authStrategies) {
      passport.use(strategy);
    }

    const app = createExpressServer({
      controllers,
      middlewares: [ErrorHandlerMiddleware],
      authorizationChecker,
      defaultErrorHandler: false
    });

    app.use(session({ secret: process.env.PASSPORT_JS_SESSION_SECRET_KEY!, resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    const storage = getMetadataArgsStorage();
    const openAPISpec = routingControllersToSpec(storage);

    const swaggerMetadataOptions = JSON.parse(process.env.SWAGGER_METADATA_SCHEMA_OPTION!);
    const validationMetadatasToSchema = validationMetadatasToSchemas(swaggerMetadataOptions);
    const schemasList = getSchemasList();

    const schemas = { ...validationMetadatasToSchema, ...schemasList };

    const components = { ...JSON.parse(process.env.SWAGGER_COMPONENTS_OPTION!), schemas };
    const security = JSON.parse(process.env.SWAGGER_SECURITY_OPTION!);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup({ ...openAPISpec, components, security }));

    return app;
  }
}

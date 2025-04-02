import { createExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { Express, Request } from 'express';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import passport from 'passport';
import { OpenAPIObject, SchemaObject } from 'openapi3-ts';

import { HealthcheckController } from 'api/v1/healthcheck.controller';
import { AuthController } from 'api/v1/auth.controller';
import { InvoicesController } from 'api/v1/invoices.controller';
import { OrdersController } from 'api/v1/orders.controller';
import { RolesController } from 'api/v1/roles.controller';
import { UsersController } from 'api/v1/users.controller';
import { authorizationChecker, currentUserChecker } from 'application/helpers/authorization-checker.helper';
import { getSchemasList } from 'application/helpers/swagger-schemas.helper';
import { GlobalErrorHandlerMiddleware, globalErrorHandler } from 'core/middlewares/error-handler.middleware';
import { HelmetMiddleware } from 'core/middlewares/helmet.middleware';
import { passportConfig } from 'core/configs/passport.config';
import { swaggerConfig } from 'core/configs/swagger.config';
import { NotFoundError } from 'core/errors';
import { RateLimitMiddleware } from 'core/middlewares/rate-limit.middleware';
import { AuthStrategiesInfrastructure } from 'infrastructure/auth/auth-strategies.infrastructure';

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
      middlewares: [RateLimitMiddleware, HelmetMiddleware, GlobalErrorHandlerMiddleware],
      authorizationChecker,
      currentUserChecker,
      defaultErrorHandler: false
    });

    app.use(session({ secret: passportConfig.PASSPORT_JS_SESSION_SECRET_KEY, resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    const storage = getMetadataArgsStorage();
    const openAPISpec = routingControllersToSpec(storage);

    const validationMetadatasToSchema = validationMetadatasToSchemas(swaggerConfig.SWAGGER_METADATA_SCHEMA_OPTION);
    const schemasList = getSchemasList();

    const schemas = { ...validationMetadatasToSchema, ...schemasList } as Record<string, SchemaObject>;

    const components = { ...swaggerConfig.SWAGGER_COMPONENTS_OPTION, schemas };
    const security = swaggerConfig.SWAGGER_SECURITY_OPTION;

    const swaggerDocument: OpenAPIObject = {
      ...openAPISpec,
      components,
      security,
      info: swaggerConfig.INFO,
      servers: swaggerConfig.SERVERS
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true
      }
    }));

    app.all('*', (req: Request) => {
      throw new NotFoundError(`Cannot find ${req.method} on ${req.url}`);
    });

    app.use(globalErrorHandler);

    return app;
  }
}

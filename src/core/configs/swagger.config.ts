import dotenv from 'dotenv';
import { SecuritySchemeObject } from 'openapi3-ts';

dotenv.config();

const swaggerConfig = {
  SWAGGER_METADATA_SCHEMA_OPTION: {
    refPointerPrefix: '#/components/schemas/'
  },
  SWAGGER_COMPONENTS_OPTION: {
    securitySchemes: {
      bearerAuth: {
        type: 'http' as const,
        scheme: 'bearer' as const,
        bearerFormat: 'JWT' as const
      } satisfies SecuritySchemeObject
    }
  },
  SWAGGER_SECURITY_OPTION: [
    { bearerAuth: [] }
  ],
  INFO: {
    title: 'Invoices Hub API',
    version: '1.0.0',
    description: 'API documentation for the Invoices Hub application',
    contact: {
      name: 'API Support',
      email: 'support@invoiceshub.com'
    }
  },
  SERVERS: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development'
    }
  ]
};

export { swaggerConfig };

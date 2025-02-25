import dotenv from 'dotenv';

dotenv.config();

const swaggerConfig = {
  SWAGGER_METADATA_SCHEMA_OPTION: process.env.SWAGGER_METADATA_SCHEMA_OPTION,
  SWAGGER_COMPONENTS_OPTION: process.env.SWAGGER_COMPONENTS_OPTION,
  SWAGGER_SECURITY_OPTION: process.env.SWAGGER_SECURITY_OPTION
} as const;

export default swaggerConfig;

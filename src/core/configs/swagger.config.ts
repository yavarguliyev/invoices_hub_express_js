import dotenv from 'dotenv';

dotenv.config();

export const swaggerConfig = {
  SWAGGER_METADATA_SCHEMA_OPTION: JSON.stringify(process.env.SWAGGER_METADATA_SCHEMA_OPTION),
  SWAGGER_COMPONENTS_OPTION: JSON.stringify(process.env.SWAGGER_COMPONENTS_OPTION),
  SWAGGER_SECURITY_OPTION: JSON.stringify(process.env.SWAGGER_SECURITY_OPTION)
};

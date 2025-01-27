declare namespace NodeJS {
  interface ProcessEnv {
    // app configs
    PORT: string;
    NODE_ENV: string;
    SERVER_TIMEOUT: string;

    // redis configs
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_PASSWORD: string;
    REDIS_URL: string;
    REDIS_DEFAULT_CACHE_TTL: string;

    // rabbitmq configs
    RABBITMQ_URL: string;
    RABBITMQ_USER: string;
    RABBITMQ_PASSWORD: string;

    // postgres configs
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    DB_DEFAULT_TYPE: string;
    DB_DEFAULT_HOST: string;
    DB_DEFAULT_PORT: string;
    DB_DEFAULT_USERNAME: string;
    DB_DEFAULT_PASSWORD: string;
    DB_DEFAULT_DATABASE: string;
    DB_CONNECTION: string;
  }
}

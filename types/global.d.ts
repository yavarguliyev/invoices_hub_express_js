declare namespace NodeJS {
  interface ProcessEnv {
    // app configs
    PORT: string;
    NODE_ENV: string;
    KEEP_ALIVE_TIMEOUT: string;
    HEADERS_TIMEOUT: string;
    SERVER_TIMEOUT: string;
    JWT_SECRET_KEY: string;
    JWT_EXPIRES_IN: string;
    PASSPORT_JS_SESSION_SECRET_KEY: string;
    CLUSTER_WORKERS: string;
    WORKER_THREADS: string;
    SHUT_DOWN_TIMER: string;
    SHUTDOWN_RETRIES: string;
    SHUTDOWN_RETRY_DELAY: string;
    HEAVY_COMPUTATION_TOTAL: string;
    WORKER_FILE_DIRECTION: string;

    PASSWORD_UPPERCASE: string;
    PASSWORD_LOWERCASE: string;
    PASSWORD_NUMBERS: string;
    PASSWORD_SPECIAL: string;
    PASSWORD_LENGHT: string;
    
    STANDARD_ROLE_ID: string;

    SWAGGER_SECURITY_OPTION: string;
    SWAGGER_COMPONENTS_OPTION: string;
    SWAGGER_METADATA_SCHEMA_OPTION: string;

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

    // Rate Limiting Configuration
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    RATE_LIMIT_MESSAGE: string;
    RATE_LIMIT_ERROR_TITLE: string;
    RATE_LIMIT_ERROR_MESSAGE: string;
  }
}

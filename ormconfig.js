module.exports = [
  {
    name: 'default',
    type: process.env.DB_DEFAULT_TYPE,
    host: process.env.DB_DEFAULT_HOST,
    port: process.env.DB_DEFAULT_PORT,
    username: process.env.DB_DEFAULT_USERNAME,
    password: process.env.DB_DEFAULT_PASSWORD,
    database: process.env.DB_DEFAULT_DATABASE,
    entities: [],
    migrations: ['migrations/*.js'],
    cli: {
      migrationsDir: 'migrations'
    },
    synchronize: false,
    logging: false
  }
]
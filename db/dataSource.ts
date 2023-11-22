import { DataSource, DataSourceOptions } from 'typeorm';
import { configDotenv } from 'dotenv';
configDotenv({
    path: '.env.development'
});

export const dataSourceConfig: DataSourceOptions = {
    type: 'mariadb',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASS || 'root',
    database: process.env.NODE_ENV === 'migration' ? 'chathub_mirgration' : (process.env.DATABASE_NAME || 'chathub_db'),
    entities: ["dist/src/*/entities/**/*.entity.js"],
    migrations: ['dist/db/migrations/*.js'],
    migrationsRun: true,
    synchronize: process.env.NODE_ENV === 'development',
    logging:
        process.env.NODE_ENV === 'development'
            ? true
            : ['schema', 'error', 'warn', 'info', 'log', 'migration'],
    // synchronize: true,
};
const AppDataSource = new DataSource(dataSourceConfig);

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
export default AppDataSource;
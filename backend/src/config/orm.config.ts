import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: ['src/models/entities/**/*.ts'],
  subscribers: [],
  migrations: ['src/models/migrations/**/*.ts'],
});

AppDataSource.initialize()
  .then(() => {})
  .catch((error) => console.log(error));

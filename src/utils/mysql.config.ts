import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { loadEnvConfig } from '.';

const { MYSQL_CONFIG } = loadEnvConfig();

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: MYSQL_CONFIG.host,
  port: MYSQL_CONFIG.port,
  username: MYSQL_CONFIG.username,
  password: MYSQL_CONFIG.password,
  database: MYSQL_CONFIG.database,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: MYSQL_CONFIG.synchronize,
};

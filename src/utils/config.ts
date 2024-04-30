import { ConfigModuleOptions } from '@nestjs/config';
import { transports, format, LoggerOptions } from 'winston';
import * as chalk from 'chalk';
import { loadEnvConfig } from '.';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'winston-daily-rotate-file';

const { MYSQL_CONFIG } = loadEnvConfig();

export const configModuleOptions: ConfigModuleOptions = { isGlobal: true, ignoreEnvFile: true, load: [loadEnvConfig] };

export const winstonModuleOptions: LoggerOptions = {
  level: 'debug',
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ context, level, message, time }) => {
          const contextStr = chalk.yellow(`[${context}]`);
          return `${level} ${time} ${contextStr} ${message} `;
        }),
      ),
    }),
    new transports.DailyRotateFile({
      level: 'error',
      filename: 'logs/%DATE%.error.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '31d',
      format: format.json(),
    }),
    new transports.DailyRotateFile({
      level: 'info',
      filename: 'logs/%DATE%.info.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '31d',
      format: format.json(),
    }),
  ],
};

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

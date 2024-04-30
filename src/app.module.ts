import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { transports, format } from 'winston';
import * as chalk from 'chalk';
import { loadEnvConfig } from './utils';
import { WinstonModule } from './logger/winston.module';
import 'winston-daily-rotate-file';

const configModuleOptions = { isGlobal: true, ignoreEnvFile: true, load: [loadEnvConfig] };
const winstonModuleOptions = {
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
@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), WinstonModule.forRoot(winstonModuleOptions)],
  controllers: [],
  providers: [],
})
export class AppModule {}

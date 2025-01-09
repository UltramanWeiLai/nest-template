import { transports, format, LoggerOptions } from 'winston';
import * as chalk from 'chalk';

import 'winston-daily-rotate-file';

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

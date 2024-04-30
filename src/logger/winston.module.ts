import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerOptions } from 'winston';
import { Log } from './log';

export const WINSTON_LOGGER_TOKEN = 'WINSTON_LOGGER';

@Global()
@Module({})
export class WinstonModule {
  static forRoot(options: LoggerOptions): DynamicModule {
    return {
      module: WinstonModule,
      providers: [{ provide: WINSTON_LOGGER_TOKEN, useValue: new Log(options) }],
      exports: [WINSTON_LOGGER_TOKEN],
    };
  }
}

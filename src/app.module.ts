import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from './logger/winston.module';
import { configModuleOptions, typeOrmModuleOptions, winstonModuleOptions } from './utils';

import { TestModule } from './interface/test/test.module';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), WinstonModule.forRoot(winstonModuleOptions), TypeOrmModule.forRoot(typeOrmModuleOptions), TestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

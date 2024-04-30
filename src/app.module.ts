import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from './logger/winston.module';
import { configModuleOptions, typeOrmModuleOptions, winstonModuleOptions } from './utils/config';

@Module({
  imports: [ConfigModule.forRoot(configModuleOptions), WinstonModule.forRoot(winstonModuleOptions), TypeOrmModule.forRoot(typeOrmModuleOptions)],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from './logger/winston.module';
import { configModuleOptions, typeOrmModuleOptions, winstonModuleOptions } from './utils';
import { InterfaceModules } from './interfaces';

const JWTConfig = {
  global: true,
  secret: 'secretKey',
  signOptions: { expiresIn: '8h' },
};

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    WinstonModule.forRoot(winstonModuleOptions),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    JwtModule.register(JWTConfig),
    ...InterfaceModules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

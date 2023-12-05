import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnvConfig } from './utils';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [loadEnvConfig] })],
  controllers: [],
  providers: [],
})
export class AppModule {}

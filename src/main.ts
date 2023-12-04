import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform/transform.interceptor';
import { BaseExceptionFilter } from './exceptions/base/base.exceptions.filter';
import { HttpExceptionFilter } from './exceptions/http/http.exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局版本控制
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局过滤器
  app.useGlobalFilters(new BaseExceptionFilter(), new HttpExceptionFilter());

  await app.listen(3000);

  console.log('http://localhost:3000');
}
bootstrap();

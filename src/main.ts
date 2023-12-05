import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform/transform.interceptor';
import { BaseExceptionFilter } from './exceptions/base/base.exceptions.filter';
import { HttpExceptionFilter } from './exceptions/http/http.exceptions.filter';
import { createInterfaceDocument } from './docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置路由前缀
  app.setGlobalPrefix('api');

  // 全局版本控制
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局过滤器
  app.useGlobalFilters(new BaseExceptionFilter(), new HttpExceptionFilter());

  // 创建接口文档
  createInterfaceDocument(app);

  await app.listen(3000);

  console.log('http://localhost:3000');
}
bootstrap();

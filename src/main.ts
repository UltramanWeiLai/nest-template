import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform/transform.interceptor';
import { BaseExceptionFilter } from './exceptions/base/base.exceptions.filter';
import { HttpExceptionFilter } from './exceptions/http/http.exceptions.filter';
import { createInterfaceDocument } from './docs';
import { LogStream } from './logger/log-stream';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置路由前缀
  app.setGlobalPrefix('api');

  // 全局版本控制
  app.enableVersioning({ defaultVersion: [VERSION_NEUTRAL, '1'], type: VersioningType.URI });

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new BaseExceptionFilter(), new HttpExceptionFilter());

  // 全局字段校验
  app.useGlobalPipes(new ValidationPipe());

  // 创建接口文档
  createInterfaceDocument(app);

  await app.listen(3000);

  console.log('http://localhost:3000');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './interceptor/transform/transform.interceptor';
import { BaseExceptionFilter } from './exceptions/base/base.exceptions.filter';
import { HttpExceptionFilter } from './exceptions/http/http.exceptions.filter';
import { WINSTON_LOGGER_TOKEN } from './logger/winston.module';
import { createInterfaceDocument } from './docs';
import { corsOptionsDelegate } from './utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置路由前缀
  app.setGlobalPrefix('api/');

  // 全局版本控制
  app.enableVersioning({ defaultVersion: [VERSION_NEUTRAL], type: VersioningType.URI });

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(new BaseExceptionFilter(), new HttpExceptionFilter());

  // 全局字段校验
  app.useGlobalPipes(new ValidationPipe());

  // 全局日志
  app.useLogger(app.get(WINSTON_LOGGER_TOKEN));

  // CROS
  app.enableCors(corsOptionsDelegate);

  // 创建接口文档
  createInterfaceDocument(app);

  await app.listen(3000);

  console.log('http://localhost:3000');
}
bootstrap();

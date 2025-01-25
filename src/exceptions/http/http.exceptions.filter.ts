import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP异常过滤器
 * 用于处理所有HTTP相关的异常，确保返回统一的错误响应格式
 *
 * @class
 * @implements {ExceptionFilter}
 * @decorator @Catch(HttpException)
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).send({
      data: null,
      code: status,
      extra: { path: request.url, timestamp: new Date().toISOString() },
      msg: exception.getResponse(),
      // path: request.url,
      success: false,
    });
  }
}

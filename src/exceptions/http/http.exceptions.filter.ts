import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../business/business';

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

    const isBusinessException = exception instanceof BusinessException;
    const isBadRequestException = exception instanceof BadRequestException;
    const status = isBusinessException ? HttpStatus.OK : exception.getStatus();
    const errorResponse = exception.getResponse();

    const res = {
      data: null,
      code: status,
      extra: { path: request.url, timestamp: new Date().toISOString() },
      msg: errorResponse,
      success: false,
    };

    if (isBusinessException) res.code = errorResponse['code'];
    if (isBadRequestException || isBusinessException) res.msg = errorResponse['message'];

    response.status(status).send(res);
  }
}

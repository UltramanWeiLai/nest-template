import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../business/business';

/**
 * 全局基础异常过滤器
 * @class BaseExceptionFilter
 * @implements {ExceptionFilter}
 * @description 用于处理所有类型的异常，包括业务异常（BusinessException）
 * 统一异常响应格式，确保API返回一致的错误结构
 */
@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  /**
   * 处理捕获的异常
   * @param {HttpException} exception - 捕获的异常对象
   * @param {ArgumentsHost} host - 参数主机对象，用于获取请求和响应对象
   * @returns {void}
   * @description 根据异常类型处理异常并返回统一的响应格式
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log('exception:', exception);
    const status = exception.getStatus();

    if (exception instanceof BusinessException) {
      const error = exception.getResponse();
      return response.status(HttpStatus.OK).send({
        data: null,
        code: error['code'],
        extra: { path: request.url, timestamp: new Date().toISOString() },
        msg: error['message'],
        success: false,
      });
    }

    response.status(status).send({
      data: null,
      code: status,
      msg: exception.getResponse(),
      extra: { path: request.url, timestamp: new Date().toISOString() },
      success: false,
    });
  }
}

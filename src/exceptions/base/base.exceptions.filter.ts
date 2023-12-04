import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(request, exception);

    response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
      data: null,
      code: HttpStatus.SERVICE_UNAVAILABLE,
      msg: new ServiceUnavailableException().getResponse(),
      success: false,
    });
  }
}

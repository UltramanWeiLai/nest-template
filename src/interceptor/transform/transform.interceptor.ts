import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应接口
 * @interface IResponse
 * @template T - 响应数据的类型
 */
interface IResponse<T> {
  data: T;
}

/**
 * 响应转换拦截器
 * 用于统一处理响应数据的格式，确保所有接口返回统一的数据结构
 *
 * @class TransformInterceptor
 * @template T - 原始响应数据的类型
 * @implements {NestInterceptor<T, IResponse<T>>}
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        code: 200,
        msg: 'success',
        success: true,
      })),
    );
  }
}

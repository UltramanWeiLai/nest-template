import { Request } from 'express';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { BusinessException } from '@/exceptions/business/business';

/**
 * 登录守卫
 * @description 用于验证用户的登录状态和 JWT Token 的有效性
 * @class
 * @implements {CanActivate}
 */
@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

  /**
   * 验证用户是否已登录
   * @description 检查请求头中的 token，验证其有效性并提取用户信息
   * @param {ExecutionContext} context - 执行上下文，包含当前请求的信息
   * @returns {boolean | Promise<boolean> | Observable<boolean>} 返回是否允许访问
   * @throws {BusinessException} 当未提供 token、token 格式错误或 token 无效时抛出异常
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const bearer = (request.headers.token as string) || '';
    if (!bearer && !bearer.startsWith('Bearer')) throw BusinessException.throwUnauthorized();

    const token = bearer.split(' ')[1];
    if (!token) throw BusinessException.throwUnauthorized();

    try {
      const userInfo = this.jwtService.verify(token);
      (request as any).username = userInfo.username;
      return true;
    } catch (error) {
      throw BusinessException.throwTokenInvalid();
    }
  }
}

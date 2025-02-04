import { Request } from 'express';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { BusinessException } from '@/exceptions/business/business';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;

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

import { HttpException, HttpStatus } from '@nestjs/common';
import { BUSINESS_ERROR_CODE } from './business.error.codes';

export interface BusinessError {
  code: number;
  message: string;
}

export class BusinessException extends HttpException {
  constructor(err: BusinessError | string) {
    if (typeof err === 'string') {
      err = { code: BUSINESS_ERROR_CODE.COMMON, message: err };
    }

    super(err, HttpStatus.OK);
  }

  // 禁止访问
  static throwForbidden(message: string = 'Forbidden') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN, message });
  }

  // 401 - 未登陆
  static throwUnauthorized(message: string = 'Unauthorized') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.UNAUTHORIZED, message });
  }

  // 401 - token 过期
  static throwTokenInvalid(message: string = 'Token Invalid') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.TOKEN_INVALID, message });
  }

  // 403 - 权限不足
  static throwAccessForbidden(message: string = 'Access Forbidden') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN, message });
  }

  // 403 - 权限禁用
  static throwPermissionDisabled(message: string = 'Permission Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.PERMISSION_DISABLED, message });
  }

  // 403 - 资源禁用
  static throwResourceDisabled(message: string = 'Resource Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_DISABLED, message });
  }

  // 403 - 用户禁用
  static throwUserDisabled(message: string = 'User Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.USER_DISABLED, message });
  }

  // 404 - 未找到
  static throwNotFound(message: string = 'Not Found') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.NOT_FOUND, message });
  }

  // 404 - 资源不存在
  static throwResourceNotFound(message: string = 'Resource Not Found') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_NOT_FOUND, message });
  }

  // 409 - 资源已占用
  static throwResourceOccupied(message: string = 'Resource Occupied') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_OCCUPIED, message });
  }

  // 409 - 用户已存在
  static throwUserExists(message: string = 'User Exists') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCOUNT_ALREADY_EXIST, message });
  }
}

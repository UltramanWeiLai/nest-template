import { HttpException, HttpStatus } from '@nestjs/common';
import { BUSINESS_ERROR_CODE } from './business.error.codes';

/**
 * 业务错误接口
 * @interface BusinessError
 * @description 定义业务异常的基本结构
 */
export interface BusinessError {
  /** 错误码 */
  code: number;
  /** 错误信息 */
  message: string;
}

/**
 * 业务异常类
 * @class BusinessException
 * @extends {HttpException}
 * @description 用于处理业务逻辑相关的异常
 */
export class BusinessException extends HttpException {
  /**
   * 创建业务异常实例
   * @param {BusinessError | string} err - 错误信息，可以是 BusinessError 对象或字符串
   */
  constructor(err: BusinessError | string) {
    if (typeof err === 'string') err = { code: BUSINESS_ERROR_CODE.COMMON, message: err };

    super(err, HttpStatus.OK);
  }

  // 禁止访问
  /**
   * 抛出禁止访问异常
   * @param {string} [message='Forbidden'] - 错误信息
   * @throws {BusinessException} 抛出禁止访问异常
   */
  static throwForbidden(message = 'Forbidden') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN, message });
  }

  // 401 - 未登陆
  /**
   * 抛出未授权异常
   * @param {string} [message='Unauthorized'] - 错误信息
   * @throws {BusinessException} 抛出未授权异常
   */
  static throwUnauthorized(message = 'Unauthorized') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.UNAUTHORIZED, message });
  }

  // 401 - token 过期
  /**
   * 抛出令牌无效异常
   * @param {string} [message='Token Invalid'] - 错误信息
   * @throws {BusinessException} 抛出令牌无效异常
   */
  static throwTokenInvalid(message = 'Token Invalid') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.TOKEN_INVALID, message });
  }

  // 403 - 权限不足
  /**
   * 抛出访问禁止异常
   * @param {string} [message='Access Forbidden'] - 错误信息
   * @throws {BusinessException} 抛出访问禁止异常
   */
  static throwAccessForbidden(message = 'Access Forbidden') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN, message });
  }

  // 403 - 权限禁用
  /**
   * 抛出权限禁用异常
   * @param {string} [message='Permission Disabled'] - 错误信息
   * @throws {BusinessException} 抛出权限禁用异常
   */
  static throwPermissionDisabled(message = 'Permission Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.PERMISSION_DISABLED, message });
  }

  // 403 - 资源禁用
  /**
   * 抛出资源禁用异常
   * @param {string} [message='Resource Disabled'] - 错误信息
   * @throws {BusinessException} 抛出资源禁用异常
   */
  static throwResourceDisabled(message = 'Resource Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_DISABLED, message });
  }

  // 403 - 用户禁用
  /**
   * 抛出用户禁用异常
   * @param {string} [message='User Disabled'] - 错误信息
   * @throws {BusinessException} 抛出用户禁用异常
   */
  static throwUserDisabled(message = 'User Disabled') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.USER_DISABLED, message });
  }

  // 404 - 未找到
  /**
   * 抛出未找到异常
   * @param {string} [message='Not Found'] - 错误信息
   * @throws {BusinessException} 抛出未找到异常
   */
  static throwNotFound(message = 'Not Found') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.NOT_FOUND, message });
  }

  // 404 - 资源不存在
  /**
   * 抛出资源不存在异常
   * @param {string} [message='Resource Not Found'] - 错误信息
   * @throws {BusinessException} 抛出资源不存在异常
   */
  static throwResourceNotFound(message = 'Resource Not Found') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_NOT_FOUND, message });
  }

  // 409 - 资源已占用
  /**
   * 抛出资源已占用异常
   * @param {string} [message='Resource Occupied'] - 错误信息
   * @throws {BusinessException} 抛出资源已占用异常
   */
  static throwResourceOccupied(message = 'Resource Occupied') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.RESOURCE_OCCUPIED, message });
  }

  // 409 - 用户已存在
  /**
   * 抛出用户已存在异常
   * @param {string} [message='User Exists'] - 错误信息
   * @throws {BusinessException} 抛出用户已存在异常
   */
  static throwUserExists(message = 'User Exists') {
    throw new BusinessException({ code: BUSINESS_ERROR_CODE.ACCOUNT_ALREADY_EXIST, message });
  }
}

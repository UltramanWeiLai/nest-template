import { BusinessException } from './business';
import { BUSINESS_ERROR_CODE } from './business.error.codes';
import { HttpStatus } from '@nestjs/common';

describe('BusinessException', () => {
  describe('constructor', () => {
    it('should create instance with string error message', () => {
      const errorMessage = 'Test error message';
      const exception = new BusinessException(errorMessage);

      expect(exception).toBeDefined();
      expect(exception.getResponse()).toEqual({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: errorMessage,
      });
      expect(exception.getStatus()).toBe(HttpStatus.OK);
    });

    it('should create instance with BusinessError object', () => {
      const businessError = {
        code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
        message: 'Custom error message',
      };
      const exception = new BusinessException(businessError);

      expect(exception).toBeDefined();
      expect(exception.getResponse()).toEqual(businessError);
      expect(exception.getStatus()).toBe(HttpStatus.OK);
    });
  });

  describe('throwForbidden', () => {
    it('should throw BusinessException with ACCESS_FORBIDDEN code', () => {
      expect(() => BusinessException.throwForbidden()).toThrow(BusinessException);

      try {
        BusinessException.throwForbidden();
      } catch (error) {
        expect(error).toBeInstanceOf(BusinessException);
        expect(error.getResponse()).toEqual({
          code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
          message: 'Forbidden',
        });
        expect(error.getStatus()).toBe(HttpStatus.OK);
      }
    });
  });
});

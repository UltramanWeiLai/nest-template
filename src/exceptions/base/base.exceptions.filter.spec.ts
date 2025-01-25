import { BaseExceptionFilter } from './base.exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BusinessError, BusinessException } from '../business/business';
import { BUSINESS_ERROR_CODE } from '../business/business.error.codes';

describe('BaseFilter', () => {
  let filter: BaseExceptionFilter;
  let mockResponse;
  let mockRequest;
  let mockHost;

  beforeEach(() => {
    filter = new BaseExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/test-url',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle regular HttpException correctly', () => {
    const errorMessage = 'Test error message';
    const exception = new HttpException(errorMessage, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith({
      data: null,
      code: HttpStatus.BAD_REQUEST,
      msg: errorMessage,
      extra: {
        path: '/test-url',
        timestamp: expect.any(String),
      },
      success: false,
    });
  });

  it('should handle BusinessException correctly', () => {
    const businessError: BusinessError = {
      code: BUSINESS_ERROR_CODE.COMMON,
      message: 'Business error occurred',
    };
    const exception = new BusinessException(businessError);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.send).toHaveBeenCalledWith({
      data: null,
      code: businessError.code,
      msg: businessError.message,
      success: false,
    });
  });

  it('should handle BusinessException with string message', () => {
    const errorMessage = 'Simple error message';
    const exception = new BusinessException(errorMessage);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(mockResponse.send).toHaveBeenCalledWith({
      data: null,
      code: BUSINESS_ERROR_CODE.COMMON,
      msg: errorMessage,
      success: false,
    });
  });

  it('should handle BusinessException.throwForbidden correctly', () => {
    expect(() => {
      BusinessException.throwForbidden();
    }).toThrow(BusinessException);

    try {
      BusinessException.throwForbidden();
    } catch (exception) {
      filter.catch(exception, mockHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith({
        data: null,
        code: BUSINESS_ERROR_CODE.ACCESS_FORBIDDEN,
        msg: 'Forbidden',
        success: false,
      });
    }
  });

  it('should handle HttpException with complex response object', () => {
    const errorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: ['validation error 1', 'validation error 2'],
      error: 'Bad Request',
    };
    const exception = new HttpException(errorResponse, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalledWith({
      data: null,
      code: HttpStatus.BAD_REQUEST,
      msg: errorResponse,
      extra: {
        path: '/test-url',
        timestamp: expect.any(String),
      },
      success: false,
    });
  });
});

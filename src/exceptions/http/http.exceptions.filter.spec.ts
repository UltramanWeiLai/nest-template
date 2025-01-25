import { HttpExceptionFilter } from './http.exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('HttpFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse;
  let mockRequest;
  let mockHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
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

  it('should handle HttpException with simple message correctly', () => {
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

  it('should handle different HTTP status codes correctly', () => {
    const errorMessage = 'Not Found';
    const exception = new HttpException(errorMessage, HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.send).toHaveBeenCalledWith({
      data: null,
      code: HttpStatus.NOT_FOUND,
      msg: errorMessage,
      extra: {
        path: '/test-url',
        timestamp: expect.any(String),
      },
      success: false,
    });
  });
});

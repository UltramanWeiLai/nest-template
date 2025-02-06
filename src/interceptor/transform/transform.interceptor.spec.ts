import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    mockContext = {
      switchToHttp: jest.fn(),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response data to standard format', (done) => {
    const testData = { test: 'value' };
    mockCallHandler = {
      handle: () => of(testData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((response) => {
      expect(response).toEqual({
        data: testData,
        code: 200,
        msg: 'success',
        success: true,
      });
      done();
    });
  });

  it('should handle null data correctly', (done) => {
    mockCallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((response) => {
      expect(response).toEqual({
        data: null,
        code: 200,
        msg: 'success',
        success: true,
      });
      done();
    });
  });

  it('should handle array data correctly', (done) => {
    const testArray = [1, 2, 3];
    mockCallHandler = {
      handle: () => of(testArray),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((response) => {
      expect(response).toEqual({
        data: testArray,
        code: 200,
        msg: 'success',
        success: true,
      });
      done();
    });
  });
});

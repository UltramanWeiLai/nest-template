import { BaseExceptionFilter } from './base.exceptions.filter';

describe('BaseFilter', () => {
  it('should be defined', () => {
    expect(new BaseExceptionFilter()).toBeDefined();
  });
});

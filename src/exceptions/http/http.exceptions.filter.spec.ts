import { HttpExceptionFilter } from './http.exceptions.filter';

describe('HttpFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });
});

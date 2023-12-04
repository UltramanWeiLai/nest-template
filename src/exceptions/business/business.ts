import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(str: string, code = HttpStatus.OK) {
    super(str, code);
  }
}

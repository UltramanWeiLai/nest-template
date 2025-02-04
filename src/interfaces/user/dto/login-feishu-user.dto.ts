import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginFeishuUserDto {
  @ApiProperty({ example: 'abcdefghijklmn' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

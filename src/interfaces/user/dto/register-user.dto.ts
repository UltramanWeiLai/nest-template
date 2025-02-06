import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'uorb' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 32, { message: '用户名长度必须在6~32之间' })
  @Matches(/^[a-zA-Z0-9#$%.*_-]+$/, { message: '用户名只能是字母、数字或者 #、$、%、.、*、_、- 这些字符' })
  username: string;

  @ApiProperty({ example: 'yuxuan3507' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 64, { message: '密码长度必须在6~64之间' })
  password: string;
}

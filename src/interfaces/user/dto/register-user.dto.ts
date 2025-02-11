import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

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

  @ApiProperty({ example: 'buck', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiProperty({ example: '1234567890@qq.com', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Matches(/^[a-zA-Z0-9#$%.*_-]+@[a-zA-Z0-9#$%.*_-]+\.[a-zA-Z0-9#$%.*_-]+$/, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  @Matches(/^1[3-9][0-9]{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  avatar?: string;
}

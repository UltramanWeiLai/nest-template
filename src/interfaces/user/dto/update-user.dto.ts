import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
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

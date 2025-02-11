import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, IsInt, IsPositive } from 'class-validator';

export class QueryUserDto {
  @ApiProperty({ example: 'uorb', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'buck', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiProperty({ example: '1234567890@qq.com', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  email?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  currPage?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}

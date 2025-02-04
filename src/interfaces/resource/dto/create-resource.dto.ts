import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: '资源名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '资源 key' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ example: '资源描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

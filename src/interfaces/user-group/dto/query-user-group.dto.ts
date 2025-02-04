import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class QueryUserGroupDto {
  @ApiProperty({ example: '用户组名称', required: false })
  @IsOptional()
  @IsString({ message: '用户组名称必须是字符串' })
  name?: string;

  @ApiProperty({ example: '用户 id', required: false })
  @IsOptional()
  @IsInt({ message: '用户 id 必须是整数' })
  userId?: number;

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

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PowerAction } from '../entities/power.entity';
import { Type } from 'class-transformer';

export class QueryPowerDto {
  @ApiProperty({ description: '资源 key', example: 'user' })
  @IsOptional()
  @IsString()
  resourceKey?: string;

  @ApiProperty({ description: '权限名称', example: '用户管理' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '权限动作', example: PowerAction.View, enum: PowerAction })
  @IsOptional()
  @IsString()
  @IsEnum(PowerAction, { message: 'action 必须是 PowerAction 枚举的一个有效值' })
  action?: PowerAction;

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

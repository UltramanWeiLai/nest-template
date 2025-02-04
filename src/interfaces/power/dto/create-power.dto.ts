import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PowerAction } from '../entities/power.entity';

export class CreatePowerDto {
  @ApiProperty({ description: '资源 key', example: 'user' })
  @IsNotEmpty()
  @IsString()
  resourceKey: string;

  @ApiProperty({ description: '权限名称', example: '用户管理' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '权限动作', example: PowerAction.View, enum: PowerAction })
  @IsNotEmpty()
  @IsEnum(PowerAction, { message: 'action 必须是 PowerAction 枚举的一个有效值' })
  @IsString()
  action: PowerAction;

  @ApiProperty({ description: '权限描述', example: '用户管理' })
  @IsOptional()
  @IsString()
  description?: string;
}

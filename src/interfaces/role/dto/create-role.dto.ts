import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 1, description: '所属项目 ID' })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ example: '普通用户', description: '角色名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '普通用户', description: '角色描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

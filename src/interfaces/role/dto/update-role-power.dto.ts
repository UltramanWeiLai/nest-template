import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayUnique } from 'class-validator';

export class UpdateRolePowerDto {
  @ApiProperty({ description: '权限 ID 数组', example: [1, 2, 3] })
  @IsArray({ message: '权限 ID 必须是数组' })
  @ArrayUnique({ message: '权限 ID 数组不能有重复的' })
  power: number[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayUnique } from 'class-validator';

export class UpdateUserGroupRoleDto {
  @ApiProperty({ description: '角色 ID 数组', example: [1, 2, 3] })
  @IsArray({ message: '角色 ID 必须是数组' })
  @ArrayUnique({ message: '角色 ID 数组不能有重复的' })
  role: number[];
}

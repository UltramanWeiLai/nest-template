import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray } from 'class-validator';

export class UpdateUserGroupUserDto {
  @ApiProperty({ description: '用户 ID 数组', example: [1, 2, 3] })
  @IsArray({ message: '用户 ID 必须是数组' })
  @ArrayUnique({ message: '用户 ID 数组不能有重复的' })
  user: number[];
}

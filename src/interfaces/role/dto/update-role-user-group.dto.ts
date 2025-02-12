import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class UpdateRoleUserGroupDto {
  @ApiProperty({ description: '用户组ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  group: number[];
}

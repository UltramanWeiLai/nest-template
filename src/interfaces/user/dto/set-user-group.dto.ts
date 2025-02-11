import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class SetUserGroupDto {
  @ApiProperty({ description: '用户组ID列表' })
  @IsArray()
  @IsNumber({}, { each: true })
  group: number[];
}

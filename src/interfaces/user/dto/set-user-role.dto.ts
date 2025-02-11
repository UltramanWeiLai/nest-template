import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class SetUserRoleDto {
  @ApiProperty({ description: '角色ID列表' })
  @IsArray()
  @IsNumber({}, { each: true })
  role: number[];
}

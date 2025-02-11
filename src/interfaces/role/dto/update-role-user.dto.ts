import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class UpdateRoleUserDto {
  @ApiProperty({ description: '用户ID列表', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  user: number[];
}

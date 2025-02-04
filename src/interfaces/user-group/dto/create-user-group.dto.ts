import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserGroupDto {
  @ApiProperty({ example: '用户组名称' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 128, { message: '用户组名称长度必须在2~128之间' })
  name: string;

  @ApiProperty({ example: '用户组描述' })
  @IsOptional()
  @IsString()
  @Length(0, 128, { message: '用户组描述长度必须在0~128之间' })
  description?: string;
}

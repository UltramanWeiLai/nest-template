import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'buck', required: false })
  @IsString()
  @Length(1, 64)
  name: string;
}

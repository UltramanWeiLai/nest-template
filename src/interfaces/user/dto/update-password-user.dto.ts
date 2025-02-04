import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdatePasswordUserDto {
  @ApiProperty({ example: 'buck.pan' })
  @IsString()
  @Length(6, 64)
  username: string;

  @ApiProperty({ example: 'yuxuan3507' })
  @IsString()
  @Length(6, 64)
  password: string;
}

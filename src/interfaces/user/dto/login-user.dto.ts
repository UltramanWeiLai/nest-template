import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'buck.pan' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 32)
  username: string;

  @ApiProperty({ example: 'yuxuan3507' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 64)
  password: string;
}

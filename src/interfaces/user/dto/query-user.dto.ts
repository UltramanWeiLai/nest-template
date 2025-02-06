import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, IsInt, IsPositive } from 'class-validator';

export class QueryUserDto {
  @ApiProperty({ example: 'buck.pan', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'buck', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  currPage?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}

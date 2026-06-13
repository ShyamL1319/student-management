import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search term', minLength: 1 })
  @IsString()
  @MinLength(1)
  q!: string;
}

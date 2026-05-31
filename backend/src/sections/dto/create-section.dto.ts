import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  classRef: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;
}

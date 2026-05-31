import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isActive: boolean;
}

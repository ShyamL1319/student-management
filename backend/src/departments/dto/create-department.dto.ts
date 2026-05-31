import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  school: string;

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

import {
  IsString,
  IsOptional,
  IsMongoId,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  course?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  teachers?: string[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

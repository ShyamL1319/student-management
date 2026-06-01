import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExamScheduleDto } from './schedule.dto';

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Exam type e.g., UNIT_TEST, MID_TERM, FINAL' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  academicYear?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  class?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  section?: string;

  @ApiProperty({ type: [ExamScheduleDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamScheduleDto)
  schedule?: ExamScheduleDto[];
}

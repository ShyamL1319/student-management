import {
  IsDateString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExamScheduleDto {
  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  date!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxMarks?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  passingMarks?: number;
}

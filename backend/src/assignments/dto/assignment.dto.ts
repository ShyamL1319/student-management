import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  classId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ required: false, default: 100 })
  @IsNumber()
  @IsOptional()
  maxMarks?: number;
}

export class SubmitAssignmentDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class GradeSubmissionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  marksObtained: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}

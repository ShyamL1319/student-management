import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsMongoId,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LatePolicyDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  allowLate: boolean;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  gracePeriodMinutes: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyPercentagePerDay: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxPenaltyPercentage: number;
}

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Math Homework' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Complete exercises 1 to 5' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '65239e3fcf93ba001b903e0f' })
  @IsMongoId()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: '65239e3fcf93ba001b903e1a' })
  @IsMongoId()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: '2026-06-15T23:59:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxMarks?: number;

  @ApiPropertyOptional({ example: 'https://s3.com/attachments/math.pdf' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ example: 'math.pdf' })
  @IsString()
  @IsOptional()
  attachmentName?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ type: LatePolicyDto })
  @ValidateNested()
  @Type(() => LatePolicyDto)
  @IsOptional()
  latePolicy?: LatePolicyDto;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  classId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxMarks?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  attachmentName?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional({ type: LatePolicyDto })
  @ValidateNested()
  @Type(() => LatePolicyDto)
  @IsOptional()
  latePolicy?: LatePolicyDto;
}

export class SubmitAssignmentDto {
  @ApiProperty({ example: 'https://s3.com/submissions/potter.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ example: 'potter.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 102400 })
  @IsNumber()
  @Min(1)
  fileSize: number;
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 85 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  marksObtained: number;

  @ApiPropertyOptional({ example: 'Good job!' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class BulkGradeItemDto {
  @ApiProperty({ example: '65239e3fcf93ba001b903e1b' })
  @IsMongoId()
  @IsNotEmpty()
  submissionId: string;

  @ApiProperty({ example: 85 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  marksObtained: number;

  @ApiPropertyOptional({ example: 'Good job!' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class BulkGradeSubmissionDto {
  @ApiProperty({ type: [BulkGradeItemDto] })
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  @IsNotEmpty()
  grades: BulkGradeItemDto[];
}

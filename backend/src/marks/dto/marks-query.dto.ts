import { IsOptional, IsString } from 'class-validator';

export class MarksQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  examId?: string;
}

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMarkDto {
  @IsString()
  studentId: string;

  @IsString()
  subjectId: string;

  @IsString()
  examId: string;

  @IsNumber()
  @Min(0)
  marksObtained: number;

  @IsNumber()
  @Min(1)
  maxMarks: number;

  @IsOptional()
  @IsString()
  grade?: string;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'CS101', description: 'The code of the course' })
  @IsNotEmpty()
  @IsString()
  courseCode!: string;

  @ApiProperty({ example: 'Introduction to Computer Science', description: 'The name of the course' })
  @IsNotEmpty()
  @IsString()
  courseName!: string;

  @ApiProperty({ example: 3, description: 'Number of credit hours' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  creditHours!: number;

  @ApiPropertyOptional({ example: 'Basic concepts of computer science', description: 'Description of the course' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '5f8d0d55b54764421b7156d1', description: 'Department ID' })
  @IsNotEmpty()
  @IsMongoId()
  department!: string;
}

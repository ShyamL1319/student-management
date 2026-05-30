import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StudentStatus } from '../schemas/student.schema';

export class ListStudentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 10;

  @ApiPropertyOptional({ example: 'aarav' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: StudentStatus })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;
}

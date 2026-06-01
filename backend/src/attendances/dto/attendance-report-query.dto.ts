import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceType } from '../schemas/attendance.schema';

export class AttendanceReportQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Date for daily report',
  })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    example: 6,
    minimum: 1,
    description: 'Month number for monthly report',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  month?: number;

  @ApiPropertyOptional({
    example: 2026,
    description: 'Year for monthly report',
  })
  @IsInt()
  @Min(1900)
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({
    enum: Object.values(AttendanceType),
    description: 'Attendance type filter',
  })
  @IsEnum(AttendanceType)
  @IsOptional()
  attendeeType?: AttendanceType;

  @ApiPropertyOptional({
    example: '507f1f77bcf86cd799439011',
    description: 'Student, teacher or staff ID filter',
  })
  @IsMongoId()
  @IsOptional()
  attendeeId?: string;
}

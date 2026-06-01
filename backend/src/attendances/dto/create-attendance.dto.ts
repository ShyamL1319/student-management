import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus, AttendanceType } from '../schemas/attendance.schema';

export class CreateAttendanceDto {
  @ApiProperty({
    enum: Object.values(AttendanceType),
    description: 'Type of attendee',
  })
  @IsEnum(AttendanceType)
  attendeeType!: AttendanceType;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the student, teacher or staff member',
  })
  @IsMongoId()
  attendeeId!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'School ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  school?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Academic year ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Class ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  class?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Section ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  section?: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Attendance date in YYYY-MM-DD format',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    enum: Object.values(AttendanceStatus),
    description: 'Attendance status',
  })
  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @ApiProperty({
    example: 'Attended morning session',
    description: 'Optional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'User ID who recorded the attendance',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  recordedBy?: string;

  @ApiProperty({
    example: true,
    description: 'Is the attendance record active',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}

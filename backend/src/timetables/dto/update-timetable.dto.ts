import { IsString, IsEnum, IsMongoId, IsOptional, IsBoolean } from 'class-validator';
import { DayOfWeek } from '../schemas/timetable.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTimetableDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Class ID', required: false })
  @IsMongoId()
  @IsOptional()
  class?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Academic Year ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  academicYear?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Teacher ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  teacher?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Subject ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Section ID',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  section?: string;

  @ApiProperty({
    enum: Object.values(DayOfWeek),
    description: 'Day of week',
    required: false,
  })
  @IsEnum(DayOfWeek)
  @IsOptional()
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    example: '09:00',
    description: 'Start time in HH:mm format',
    required: false,
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    example: '10:00',
    description: 'End time in HH:mm format',
    required: false,
  })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({
    example: 'Room 101',
    description: 'Room or location',
    required: false,
  })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({
    example: 'Regular class',
    description: 'Additional notes',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: true,
    description: 'Is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

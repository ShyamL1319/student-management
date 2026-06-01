import { IsString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { DayOfWeek } from '../schemas/timetable.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimetableDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Class ID' })
  @IsMongoId()
  class!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Academic Year ID',
  })
  @IsMongoId()
  academicYear!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Teacher ID',
  })
  @IsMongoId()
  teacher!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Subject ID',
  })
  @IsMongoId()
  subject!: string;

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
  })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    example: '09:00',
    description: 'Start time in HH:mm format',
  })
  @IsString()
  startTime!: string;

  @ApiProperty({
    example: '10:00',
    description: 'End time in HH:mm format',
  })
  @IsString()
  endTime!: string;

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
}

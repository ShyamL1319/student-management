import { IsMongoId, IsString, IsEnum } from 'class-validator';
import { DayOfWeek } from '../schemas/timetable.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CheckConflictDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Teacher ID',
  })
  @IsMongoId()
  teacher!: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Class ID',
  })
  @IsMongoId()
  class!: string;

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
    example: '507f1f77bcf86cd799439011',
    description: 'Timetable ID to exclude (for updates)',
    required: false,
  })
  @IsMongoId()
  excludeTimetableId?: string;
}

export class ConflictResponseDto {
  hasConflict: boolean;
  conflicts: Array<{
    timetableId: string;
    class: string;
    teacher: string;
    subject: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    conflictType: 'TEACHER_DOUBLE_BOOKING' | 'CLASS_OVERLAP';
  }>;
}

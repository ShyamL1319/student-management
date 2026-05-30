import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsMongoId,
} from 'class-validator';
import { StudentGender, StudentStatus } from '../schemas/student.schema';

export class CreateStudentDto {
  @ApiProperty({ example: 'STU12345' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'Aarav' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'aarav@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+919888888888' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ enum: StudentGender })
  @IsEnum(StudentGender)
  gender!: StudentGender;

  @ApiProperty({ example: '2010-04-12' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth!: Date;

  @ApiProperty({ example: '42 Park Street, Bengaluru' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: '5f8d0d55b54764421b7156d1', description: 'Department ID' })
  @IsNotEmpty()
  @IsMongoId()
  department!: string;

  @ApiProperty({ example: '2024-06-01' })
  @Type(() => Date)
  @IsDate()
  enrollmentDate!: Date;

  @ApiPropertyOptional({ enum: StudentStatus, default: StudentStatus.Active })
  @IsEnum(StudentStatus)
  status?: StudentStatus = StudentStatus.Active;
}

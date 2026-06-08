import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterParentDto {
  @ApiProperty({ example: 'parent@example.com', description: 'Unique email address for parent registration' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Parent account password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+1234567890', required: false, description: 'Optional phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Father', required: false, description: 'Relationship designation' })
  @IsString()
  @IsOptional()
  relationshipType?: string;
}

export class LinkChildDto {
  @ApiProperty({ example: 'ADM-2026-000001', description: 'Admission number of the student child' })
  @IsString()
  @IsNotEmpty()
  admissionNumber!: string;

  @ApiProperty({ example: '2015-05-15', description: 'Child Date of Birth matching records exactly' })
  @IsDateString()
  @IsNotEmpty()
  dob!: string;
}

export class SendParentMessageDto {
  @ApiProperty({ example: 'teacherId123', description: 'ObjectId of the staff/teacher recipient' })
  @IsString()
  @IsNotEmpty()
  recipientId!: string;

  @ApiProperty({ example: 'Absence notification', required: false, description: 'Message subject line' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Leo will be absent tomorrow.', description: 'Body text content of the message' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateParentProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateParentDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Father', required: false })
  @IsString()
  @IsOptional()
  relationshipType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  children?: string[];
}

export class UpdateParentDto {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  relationshipType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  children?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  isActive?: boolean;
}

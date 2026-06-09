import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionStage } from '../schemas/admission.schema';

class StudentInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}

class ParentInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  relationship: string; // 'Father' | 'Mother' | 'Guardian'

  @ApiProperty()
  @IsOptional()
  @IsString()
  occupation?: string;
}

class DocumentUploadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateAdmissionDto {
  @ApiProperty({ type: StudentInfoDto })
  @ValidateNested()
  @Type(() => StudentInfoDto)
  studentInfo: StudentInfoDto;

  @ApiProperty({ type: ParentInfoDto })
  @ValidateNested()
  @Type(() => ParentInfoDto)
  parentInfo: ParentInfoDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeLevel: string;

  @ApiProperty({ type: [DocumentUploadDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentUploadDto)
  documents?: DocumentUploadDto[];
}

export class ScheduleInterviewDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  interviewMode: string; // 'Online' | 'In-person'

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  panelMembers?: string[];
}

export class EvaluateApplicationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  documentScore: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  interviewScore: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  entranceScore: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  evaluationRemarks?: string;
}

export class UpdateAdmissionStatusDto {
  @ApiProperty({ enum: AdmissionStage })
  @IsEnum(AdmissionStage)
  status: AdmissionStage;
}

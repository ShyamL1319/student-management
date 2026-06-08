import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdmissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  applicantName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeLevel: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  entranceScore?: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  parentEmail: string;
}

export class UpdateAdmissionStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;
}

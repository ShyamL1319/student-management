import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: '2026-06-10T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-06-12T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ enum: ['Sick', 'Casual', 'Medical'], example: 'Sick' })
  @IsEnum(['Sick', 'Casual', 'Medical'])
  @IsNotEmpty()
  type: string; // 'Sick' | 'Casual' | 'Medical'

  @ApiProperty({ example: 'Flu and severe fever' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    required: false,
    example: 'https://example.com/medical-cert.pdf',
  })
  @IsUrl()
  @IsOptional()
  medicalAttachmentUrl?: string;
}

export class UpdateLeaveRequestStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ required: false, example: 'Approved for 3 days' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class AllocateLeaveBalanceDto {
  @ApiProperty({ example: '608f...user_id' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: ['Sick', 'Casual', 'Medical'], example: 'Sick' })
  @IsEnum(['Sick', 'Casual', 'Medical'])
  @IsNotEmpty()
  leaveType: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @IsNotEmpty()
  allocated: number;

  @ApiProperty({ required: false, example: 2026 })
  @IsNumber()
  @IsOptional()
  year?: number;
}

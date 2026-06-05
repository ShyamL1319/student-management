import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateStaffDto {
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  department?: Types.ObjectId | string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

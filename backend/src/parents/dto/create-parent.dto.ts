import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateParentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  students?: Types.ObjectId[] | string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

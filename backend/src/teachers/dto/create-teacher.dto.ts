import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateTeacherDto {
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
  @IsArray()
  subjects?: string[];

  @IsOptional()
  @IsString()
  profile?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

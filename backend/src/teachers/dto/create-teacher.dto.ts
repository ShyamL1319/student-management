import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateTeacherDto {
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
  subjects?: string[];

  @IsOptional()
  @IsString()
  profile?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

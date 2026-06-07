import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsObject,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsObject()
  @IsOptional()
  schoolId?: string;
}

export class UpdateUserRoleDto {
  @IsString()
  roleId!: string;
}

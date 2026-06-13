import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsObject,
  IsArray,
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

export class AddRoleDto {
  @IsString()
  roleId!: string;
}

export class ReplaceRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds!: string[];
}

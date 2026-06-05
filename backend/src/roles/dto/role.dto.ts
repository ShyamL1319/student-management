import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { RoleEnum } from '../../common/enums/role.enum';

export class CreateRoleDto {
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  name!: RoleEnum;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[]; // IDs of permissions
}

export class UpdateRoleDto {
  @IsEnum(RoleEnum)
  @IsOptional()
  name?: RoleEnum;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}

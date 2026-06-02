import {
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuditAction, AuditStatus } from '../schemas/audit-log.schema';

export class CreateAuditLogDto {
  @IsEnum(AuditAction)
  action!: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsMongoId()
  performedBy?: string;

  @IsOptional()
  @IsObject()
  changes?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsEnum(AuditStatus)
  status!: AuditStatus;
}

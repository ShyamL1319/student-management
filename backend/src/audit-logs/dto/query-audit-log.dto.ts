import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AuditAction, AuditStatus } from '../schemas/audit-log.schema';

export class QueryAuditLogDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsMongoId()
  performedBy?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

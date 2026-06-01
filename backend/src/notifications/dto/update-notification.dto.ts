import { IsOptional, IsString, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { NotificationStatus } from '../schemas/notification.schema';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

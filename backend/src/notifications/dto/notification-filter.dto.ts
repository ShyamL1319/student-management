import { IsOptional, IsEnum, IsString } from 'class-validator';
import { NotificationChannel, NotificationEventType, NotificationStatus } from '../schemas/notification.schema';

export class NotificationFilterDto {
  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEnum(NotificationEventType)
  eventType?: NotificationEventType;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  skip?: number;
}

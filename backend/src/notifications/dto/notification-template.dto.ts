import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { NotificationChannel, NotificationEventType } from '../schemas/notification.schema';

export class CreateNotificationTemplateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(NotificationEventType)
  eventType: NotificationEventType;

  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsArray()
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsArray()
  variables?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

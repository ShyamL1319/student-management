import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @IsOptional()
  @IsString()
  notificationQuietHourStart?: string;

  @IsOptional()
  @IsString()
  notificationQuietHourEnd?: string;

  @IsOptional()
  @IsBoolean()
  doNotDisturb?: boolean;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSchoolSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateFormat?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdateBrandingSettingsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  @IsEnum(['light', 'dark', 'system'])
  @IsOptional()
  themeMode?: string;
}

export class UpdateEmailSettingsDto {
  @ApiPropertyOptional({ enum: ['smtp', 'ses', 'sendgrid'] })
  @IsEnum(['smtp', 'ses', 'sendgrid'])
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  host?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  port?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  senderEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional({ enum: ['none', 'ssl', 'tls'] })
  @IsEnum(['none', 'ssl', 'tls'])
  @IsOptional()
  encryption?: string;
}

export class UpdateSmsSettingsDto {
  @ApiPropertyOptional({ enum: ['twilio', 'whatsapp', 'other'] })
  @IsEnum(['twilio', 'whatsapp', 'other'])
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountSid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  authToken?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  senderNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappApiKey?: string;
}

export class UpdateMfaSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ enum: ['all', 'admin_only', 'optional'] })
  @IsEnum(['all', 'admin_only', 'optional'])
  @IsOptional()
  enforcement?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedMethods?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  gracePeriodDays?: number;
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alertTypes?: string[];
}

export class UpdateBackupSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'monthly'] })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  frequency?: string;

  @ApiPropertyOptional({ enum: ['s3', 'google_drive', 'local'] })
  @IsEnum(['s3', 'google_drive', 'local'])
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  s3Bucket?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  s3AccessKeyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  s3SecretAccessKey?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  retentionDays?: number;
}

export class UpdateIntegrationSettingsDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  stripeEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripePublishableKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripeSecretKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  stripeWebhookSecret?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  razorpayEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  razorpayKeyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  razorpayKeySecret?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  twilioEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twilioSid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  twilioToken?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappBusinessId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappToken?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  zoomEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zoomClientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  zoomClientSecret?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  googleWorkspaceEnabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleClientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleClientSecret?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  googleRedirectUri?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  microsoft365Enabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  microsoftClientId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  microsoftClientSecret?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  microsoftRedirectUri?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ type: UpdateSchoolSettingsDto })
  @ValidateNested()
  @Type(() => UpdateSchoolSettingsDto)
  @IsOptional()
  school?: UpdateSchoolSettingsDto;

  @ApiPropertyOptional({ type: UpdateBrandingSettingsDto })
  @ValidateNested()
  @Type(() => UpdateBrandingSettingsDto)
  @IsOptional()
  branding?: UpdateBrandingSettingsDto;

  @ApiPropertyOptional({ type: UpdateEmailSettingsDto })
  @ValidateNested()
  @Type(() => UpdateEmailSettingsDto)
  @IsOptional()
  email?: UpdateEmailSettingsDto;

  @ApiPropertyOptional({ type: UpdateSmsSettingsDto })
  @ValidateNested()
  @Type(() => UpdateSmsSettingsDto)
  @IsOptional()
  sms?: UpdateSmsSettingsDto;

  @ApiPropertyOptional({ type: UpdateMfaSettingsDto })
  @ValidateNested()
  @Type(() => UpdateMfaSettingsDto)
  @IsOptional()
  mfa?: UpdateMfaSettingsDto;

  @ApiPropertyOptional({ type: UpdateNotificationSettingsDto })
  @ValidateNested()
  @Type(() => UpdateNotificationSettingsDto)
  @IsOptional()
  notification?: UpdateNotificationSettingsDto;

  @ApiPropertyOptional({ type: UpdateBackupSettingsDto })
  @ValidateNested()
  @Type(() => UpdateBackupSettingsDto)
  @IsOptional()
  backup?: UpdateBackupSettingsDto;

  @ApiPropertyOptional({ type: UpdateIntegrationSettingsDto })
  @ValidateNested()
  @Type(() => UpdateIntegrationSettingsDto)
  @IsOptional()
  integrations?: UpdateIntegrationSettingsDto;
}

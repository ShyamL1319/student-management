import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ _id: false })
export class SchoolSettings {
  @Prop({ required: false, default: '' })
  code?: string;

  @Prop({ required: false, default: '' })
  website?: string;

  @Prop({ required: false, default: '' })
  taxId?: string;

  @Prop({ required: false, default: 'USD' })
  currency?: string;

  @Prop({ required: false, default: 'UTC' })
  timezone?: string;

  @Prop({ required: false, default: 'YYYY-MM-DD' })
  dateFormat?: string;

  @Prop({ required: false, default: 'en' })
  language?: string;
}

@Schema({ _id: false })
export class BrandingSettings {
  @Prop({ required: false, default: '' })
  logoUrl?: string;

  @Prop({ required: false, default: '' })
  faviconUrl?: string;

  @Prop({ required: false, default: '#4F46E5' })
  primaryColor?: string;

  @Prop({ required: false, default: '#06B6D4' })
  secondaryColor?: string;

  @Prop({ required: false, default: '' })
  customDomain?: string;

  @Prop({
    required: false,
    default: 'light',
    enum: ['light', 'dark', 'system'],
  })
  themeMode?: string;
}

@Schema({ _id: false })
export class EmailSettings {
  @Prop({ required: false, default: 'smtp', enum: ['smtp', 'ses', 'sendgrid'] })
  provider?: string;

  @Prop({ required: false, default: '' })
  host?: string;

  @Prop({ required: false, default: 587 })
  port?: number;

  @Prop({ required: false, default: '' })
  username?: string;

  @Prop({ required: false, default: '' })
  password?: string; // Encrypted

  @Prop({ required: false, default: '' })
  apiKey?: string; // Encrypted

  @Prop({ required: false, default: '' })
  senderEmail?: string;

  @Prop({ required: false, default: '' })
  senderName?: string;

  @Prop({ required: false, default: 'tls', enum: ['none', 'ssl', 'tls'] })
  encryption?: string;
}

@Schema({ _id: false })
export class SmsSettings {
  @Prop({
    required: false,
    default: 'twilio',
    enum: ['twilio', 'whatsapp', 'other'],
  })
  provider?: string;

  @Prop({ required: false, default: '' })
  accountSid?: string;

  @Prop({ required: false, default: '' })
  authToken?: string; // Encrypted

  @Prop({ required: false, default: '' })
  senderNumber?: string;

  @Prop({ required: false, default: '' })
  whatsappApiKey?: string; // Encrypted
}

@Schema({ _id: false })
export class MfaSettings {
  @Prop({ required: false, default: false })
  enabled?: boolean;

  @Prop({
    required: false,
    default: 'optional',
    enum: ['all', 'admin_only', 'optional'],
  })
  enforcement?: string;

  @Prop({ type: [String], required: false, default: ['totp'] })
  allowedMethods?: string[];

  @Prop({ required: false, default: 0 })
  gracePeriodDays?: number;
}

@Schema({ _id: false })
export class NotificationSettings {
  @Prop({ required: false, default: true })
  emailEnabled?: boolean;

  @Prop({ required: false, default: false })
  smsEnabled?: boolean;

  @Prop({ required: false, default: false })
  whatsappEnabled?: boolean;

  @Prop({ required: false, default: false })
  pushEnabled?: boolean;

  @Prop({
    type: [String],
    required: false,
    default: ['billing', 'attendance', 'exam'],
  })
  alertTypes?: string[];
}

@Schema({ _id: false })
export class BackupSettings {
  @Prop({ required: false, default: false })
  enabled?: boolean;

  @Prop({
    required: false,
    default: 'daily',
    enum: ['daily', 'weekly', 'monthly'],
  })
  frequency?: string;

  @Prop({
    required: false,
    default: 'local',
    enum: ['s3', 'google_drive', 'local'],
  })
  destination?: string;

  @Prop({ required: false, default: '' })
  s3Bucket?: string;

  @Prop({ required: false, default: '' })
  s3AccessKeyId?: string;

  @Prop({ required: false, default: '' })
  s3SecretAccessKey?: string; // Encrypted

  @Prop({ required: false, default: 30 })
  retentionDays?: number;
}

@Schema({ _id: false })
export class IntegrationSettings {
  @Prop({ required: false, default: false })
  stripeEnabled?: boolean;

  @Prop({ required: false, default: '' })
  stripePublishableKey?: string;

  @Prop({ required: false, default: '' })
  stripeSecretKey?: string; // Encrypted

  @Prop({ required: false, default: '' })
  stripeWebhookSecret?: string; // Encrypted

  @Prop({ required: false, default: false })
  razorpayEnabled?: boolean;

  @Prop({ required: false, default: '' })
  razorpayKeyId?: string;

  @Prop({ required: false, default: '' })
  razorpayKeySecret?: string; // Encrypted

  @Prop({ required: false, default: false })
  twilioEnabled?: boolean;

  @Prop({ required: false, default: '' })
  twilioSid?: string;

  @Prop({ required: false, default: '' })
  twilioToken?: string; // Encrypted

  @Prop({ required: false, default: false })
  whatsappEnabled?: boolean;

  @Prop({ required: false, default: '' })
  whatsappBusinessId?: string;

  @Prop({ required: false, default: '' })
  whatsappToken?: string; // Encrypted

  @Prop({ required: false, default: false })
  zoomEnabled?: boolean;

  @Prop({ required: false, default: '' })
  zoomClientId?: string;

  @Prop({ required: false, default: '' })
  zoomClientSecret?: string; // Encrypted

  @Prop({ required: false, default: false })
  googleWorkspaceEnabled?: boolean;

  @Prop({ required: false, default: '' })
  googleClientId?: string;

  @Prop({ required: false, default: '' })
  googleClientSecret?: string; // Encrypted

  @Prop({ required: false, default: '' })
  googleRedirectUri?: string;

  @Prop({ required: false, default: false })
  microsoft365Enabled?: boolean;

  @Prop({ required: false, default: '' })
  microsoftClientId?: string;

  @Prop({ required: false, default: '' })
  microsoftClientSecret?: string; // Encrypted

  @Prop({ required: false, default: '' })
  microsoftRedirectUri?: string;
}

@Schema({ timestamps: true })
export class Settings {
  @Prop({
    type: Types.ObjectId,
    ref: 'School',
    required: true,
    index: true,
    unique: true,
  })
  schoolId!: Types.ObjectId;

  @Prop({ type: SchoolSettings, default: () => ({}) })
  school!: SchoolSettings;

  @Prop({ type: BrandingSettings, default: () => ({}) })
  branding!: BrandingSettings;

  @Prop({ type: EmailSettings, default: () => ({}) })
  email!: EmailSettings;

  @Prop({ type: SmsSettings, default: () => ({}) })
  sms!: SmsSettings;

  @Prop({ type: MfaSettings, default: () => ({}) })
  mfa!: MfaSettings;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notification!: NotificationSettings;

  @Prop({ type: BackupSettings, default: () => ({}) })
  backup!: BackupSettings;

  @Prop({ type: IntegrationSettings, default: () => ({}) })
  integrations!: IntegrationSettings;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

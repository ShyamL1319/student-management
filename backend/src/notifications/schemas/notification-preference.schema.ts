import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  NotificationChannel,
  NotificationEventType,
} from './notification.schema';

@Schema({ timestamps: true })
export class NotificationPreference extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  channelPreferences: Map<NotificationChannel, boolean>;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  eventPreferences: Map<NotificationEventType, boolean>;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: true })
  smsNotifications: boolean;

  @Prop({ default: true })
  inAppNotifications: boolean;

  @Prop({})
  notificationQuietHourStart?: string; // HH:MM format

  @Prop({})
  notificationQuietHourEnd?: string; // HH:MM format

  @Prop({ default: false })
  doNotDisturb: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);

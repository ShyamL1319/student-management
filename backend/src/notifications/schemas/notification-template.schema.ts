import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  NotificationChannel,
  NotificationEventType,
} from './notification.schema';

@Schema({ timestamps: true })
export class NotificationTemplate extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: NotificationEventType, required: true })
  eventType: NotificationEventType;

  @Prop({ type: String, enum: NotificationChannel, required: true })
  channel: NotificationChannel;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({})
  htmlContent?: string;

  @Prop({ type: [String], default: [] })
  variables: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);

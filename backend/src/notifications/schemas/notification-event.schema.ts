import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationEventType } from './notification.schema';

@Schema({ timestamps: true })
export class NotificationEvent extends Document {
  @Prop({ type: String, enum: NotificationEventType, required: true })
  eventType: NotificationEventType;

  @Prop({ required: true, type: Types.ObjectId })
  triggeredBy: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  relatedEntityId: Types.ObjectId;

  @Prop({ required: true })
  relatedEntityType: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  notificationIds: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  eventData: Record<string, any>;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationEventSchema = SchemaFactory.createForClass(NotificationEvent);

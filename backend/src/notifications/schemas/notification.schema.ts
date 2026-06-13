import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  OPENED = 'opened',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in-app',
}

export enum NotificationEventType {
  ATTENDANCE_ALERT = 'attendance-alert',
  FEE_ALERT = 'fee-alert',
  RESULT_ALERT = 'result-alert',
  EXAM_SCHEDULE = 'exam-schedule',
  TIMETABLE_CHANGE = 'timetable-change',
  ANNOUNCEMENT = 'announcement',
  LEAVE_REQUESTED = 'leave-requested',
  LEAVE_APPROVED = 'leave-approved',
  LEAVE_REJECTED = 'leave-rejected',
  LEAVE_CANCELLED = 'leave-cancelled',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: Types.ObjectId })
  recipientId: Types.ObjectId;

  @Prop({ required: true })
  recipientEmail?: string;

  @Prop({ required: true })
  recipientPhone?: string;

  @Prop({ type: String, enum: NotificationEventType, required: true })
  eventType: NotificationEventType;

  @Prop({ type: String, enum: NotificationChannel, required: true })
  channel: NotificationChannel;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({})
  templateId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  templateData: Record<string, any>;

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Prop({})
  sentAt?: Date;

  @Prop({})
  deliveredAt?: Date;

  @Prop({})
  openedAt?: Date;

  @Prop({})
  failureReason?: string;

  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId })
  relatedEntityId?: Types.ObjectId;

  @Prop({})
  relatedEntityType?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

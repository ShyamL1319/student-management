import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

export enum ActivityType {
  ASSIGNMENT_SUBMISSION = 'assignment-submission',
  FEE_PAYMENT = 'fee-payment',
  EXAM_SCHEDULE = 'exam-schedule',
  ANNOUNCEMENT = 'announcement',
  ATTENDANCE = 'attendance',
  LEAVE_REQUEST = 'leave-request',
}

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ required: true, enum: Object.values(ActivityType) })
  type!: ActivityType;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ type: Types.ObjectId, required: false, ref: 'User' })
  student?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: 'School' })
  school?: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  occurredAt!: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ student: 1, type: 1, occurredAt: -1 });

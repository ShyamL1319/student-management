import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ timestamps: true })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  requesterId!: Types.ObjectId;

  @Prop({ required: true })
  requesterType!: string; // 'STUDENT' | 'TEACHER' | 'STAFF'

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true })
  type!: string; // 'Sick' | 'Casual' | 'Medical'

  @Prop({ required: true })
  reason!: string;

  @Prop({ required: true, default: 'PENDING' })
  status!: string; // 'PENDING' | 'APPROVED' | 'REJECTED'

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approvedBy?: Types.ObjectId;

  @Prop({ required: false })
  remarks?: string;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);

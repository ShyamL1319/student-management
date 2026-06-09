import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveRequestDocument = LeaveRequest & Document;

@Schema({ _id: false })
export class ApprovalStep {
  @Prop({ required: true })
  step!: number;

  @Prop({ required: true, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status!: string;

  @Prop({ required: true })
  approverRole!: string; // 'TEACHER' | 'ADMIN'

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approverId?: Types.ObjectId;

  @Prop({ required: false })
  remarks?: string;

  @Prop({ required: false })
  updatedAt?: Date;
}

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
  status!: string; // 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  approvedBy?: Types.ObjectId;

  @Prop({ required: false })
  remarks?: string;

  @Prop({ required: false })
  medicalAttachmentUrl?: string;

  @Prop({ required: true, default: 1 })
  currentStep!: number;

  @Prop({ type: [ApprovalStep], default: [] })
  approvalWorkflow!: ApprovalStep[];
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);


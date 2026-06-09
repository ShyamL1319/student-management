import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeaveBalanceDocument = LeaveBalance & Document;

@Schema({ timestamps: true })
export class LeaveBalance {
  @Prop({ type: Types.ObjectId, ref: 'School', required: false, index: true })
  schoolId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  leaveType!: string; // 'Sick' | 'Casual' | 'Medical'

  @Prop({ required: true, default: 0 })
  allocated!: number;

  @Prop({ required: true, default: 0 })
  used!: number;

  @Prop({ required: true, default: 0 })
  pending!: number;

  @Prop({ required: true, default: () => new Date().getFullYear() })
  year!: number;
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance);
LeaveBalanceSchema.index(
  { userId: 1, leaveType: 1, year: 1 },
  { unique: true },
);

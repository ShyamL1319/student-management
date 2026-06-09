import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true, index: true })
  subject!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Class', required: true, index: true })
  class!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  teacher!: Types.ObjectId;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop({ required: true, default: 100 })
  maxMarks!: number;

  @Prop({ required: false })
  attachmentUrl?: string;

  @Prop({ required: false })
  attachmentName?: string;

  @Prop({ required: true, default: false })
  isPublished!: boolean;

  @Prop({
    type: {
      allowLate: { type: Boolean, default: true },
      gracePeriodMinutes: { type: Number, default: 0 },
      penaltyPercentagePerDay: { type: Number, default: 0 },
      maxPenaltyPercentage: { type: Number, default: 50 },
    },
    default: {
      allowLate: true,
      gracePeriodMinutes: 0,
      penaltyPercentagePerDay: 0,
      maxPenaltyPercentage: 50,
    },
  })
  latePolicy!: {
    allowLate: boolean;
    gracePeriodMinutes: number;
    penaltyPercentagePerDay: number;
    maxPenaltyPercentage: number;
  };
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

// Compound indexes for tenant-scoped operations
AssignmentSchema.index({ school: 1, class: 1, isPublished: 1 });
AssignmentSchema.index({ school: 1, teacher: 1 });

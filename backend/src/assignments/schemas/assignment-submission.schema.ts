import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssignmentSubmissionDocument = AssignmentSubmission & Document;

@Schema({ _id: false })
export class SubmissionAttempt {
  @Prop({ required: true })
  fileUrl!: string;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  fileSize!: number;

  @Prop({ required: true, default: () => new Date() })
  submittedAt!: Date;

  @Prop({ required: true, default: false })
  isLate!: boolean;
}

@Schema({ timestamps: true })
export class AssignmentSubmission {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  school!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assignment', required: true, index: true })
  assignment!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  student!: Types.ObjectId;

  @Prop({ required: false })
  fileUrl?: string;

  @Prop({ required: false })
  fileName?: string;

  @Prop({ required: false })
  fileSize?: number;

  @Prop({ required: true, default: () => new Date() })
  submittedAt!: Date;

  @Prop({ required: true, default: false })
  isLate!: boolean;

  @Prop({ required: true, enum: ['Submitted', 'Graded'], default: 'Submitted' })
  status!: string; // 'Submitted', 'Graded'

  @Prop({ required: false, min: 0 })
  marksObtained?: number;

  @Prop({ required: false, min: 0, default: 0 })
  latePenaltyDeducted?: number;

  @Prop({ required: false, trim: true })
  feedback?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  gradedBy?: Types.ObjectId;

  @Prop({ required: false })
  gradedAt?: Date;

  @Prop({ type: [SubmissionAttempt], default: [] })
  attempts!: SubmissionAttempt[];
}

export const AssignmentSubmissionSchema = SchemaFactory.createForClass(AssignmentSubmission);

// Prevent a student from having multiple submission documents for a single assignment
AssignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

